import { Component, OnInit, ViewChild } from '@angular/core';
import { YardService } from '../../../services/list/yard.service';
import { AreaService } from '../../../services/list/area.service';
import { CentralService } from '../../../services/manage/central.service';
import { UtilsService } from '../../../services/utils.service';
import { Yard } from '../../../models/list/yard';
import { YardFilter } from '../../../models/filter/yardfilter';
import { AreaFilter } from '../../../models/filter/areafilter';
import { CentralFilter } from '../../../models/filter/centralfilter';
import { Router } from '@angular/router'; 
import { NgbModal,NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../../shared/modal/confirm/confirm.component';
import { YardEditComponent } from './yard-edit/yard-edit.component';
import { ASCSort, SORD_DIRECTION } from 'app/models/sort';
import { MatPaginatorIntl } from '@angular/material/paginator';
import {TranslateService} from '@ngx-translate/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { Area } from 'app/models/list/area';
import { YardImportComponent } from './yard-import/yard-import.component';
import { startWith, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { CommonFilter } from 'app/models/filter/commonfilter';

@Component({
  selector: 'app-yards',
  templateUrl: './yards.component.html',
  styleUrls: ['./yards.component.scss']
})
export class YardComponent implements OnInit {
  yardsList:any[];
  areasList:any[] = [];
  centralsList:any[] = [];
  Total: number = 0;
  searchTerm:string = '';
  pageIndex:number = 1;
  pageSizesList: number[] = [5, 10, 20, 100];
  pageSize:number = this.pageSizesList[1];
  currentUser: any;
  isLoading: boolean = true;
  firstRowOnPage: any;
  searchProvincesCtrl = new FormControl();
  searchAreasCtrl = new FormControl();
  searchCentralsCtrl = new FormControl();
  searchAdvanced: boolean = false;
  /**
   * BEGIN SORT SETTINGS
   */
  paginationSettings: any = {
    sort: new ASCSort(),
    sortToggles: [
      null,
      SORD_DIRECTION.ASC, SORD_DIRECTION.ASC, SORD_DIRECTION.ASC, SORD_DIRECTION.ASC,
      SORD_DIRECTION.ASC, SORD_DIRECTION.ASC,
      null
    ],
    columnsName:['Order', 'YardCode', 'YardName','Central','Area','Address','CampusArea','Note', 'Action'],
    columnsNameMapping: ['id', 'yardCode', 'yardName','centralName','areaName','address','area','description', ''],
    sortAbles: [false, true, true, true, false,false,true, false],
    visibles:  [true, true, true, true, true, true,true, true,true]
  }
  /**
   * END SORT SETTINGS
   */

  mainfilter = new CommonFilter();
  areaFilter: AreaFilter = new AreaFilter( this.searchTerm,this.pageIndex, this.pageSize,0, 'id','ASC');
  centralFilter: CentralFilter = new CentralFilter( this.searchTerm,this.pageIndex, this.pageSize,0, 0, 0, 'id','ASC');

  constructor(private translate: TranslateService,
    private matCus: MatPaginatorIntl, config: NgbModalConfig,public util: UtilsService, 
    private service: YardService, private centralService: CentralService,public utilsService: UtilsService, private areaService: AreaService, private modalService: NgbModal, private router: Router) {
    config.backdrop = 'static';
      config.keyboard = false;
      config.scrollable = false;
      this.updateMatTableLabel();
      translate.onLangChange.subscribe((a: any) => {
        this.updateMatTableLabel();
        matCus.changes.next();
      });
   }

  ngOnInit() {
  this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  this.mainfilter.PageIndex = 1;
  this.mainfilter.PageSize = this.pageSizesList[1];

  this.centralService.getCentralsList(this.centralFilter).subscribe((response: any) => {
       this.centralsList = response.results; 
      });
  this.areaService.getAreasList(this.areaFilter).subscribe((response : any)=>{
    this.areasList = response.results;
  });
  this.reload();
  const vgscroll = <HTMLElement>document.querySelector('.vg-scroll');
  new PerfectScrollbar(vgscroll);
  }
  updateMatTableLabel() {
    this.matCus.itemsPerPageLabel = this.translate.instant('MESSAGE.NameList.ItemsPerPage');
    this.matCus.getRangeLabel =  (page: number, pageSize: number, length: number): string => {
        if (length === 0 || pageSize === 0) {
          return this.translate.instant('MESSAGE.NameList.NoRecord');
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return this.translate.instant('MESSAGE.NameList.PageFromToOf', { startIndex: startIndex + 1, endIndex, length });
      }
  }
  remove(id : any) {
    const _this = this;
    const modalRef = this.modalService.open(ConfirmComponent, { windowClass: 'modal-confirm' });
    modalRef.componentInstance.confirmObject = 'Yard';
    modalRef.componentInstance.decide.subscribe(() => {
        _this.service.deleteYard(id).subscribe(()=>{
          _this.reload()
        });
    });
}
pageEvent(variable: any){
  this.mainfilter.PageIndex = variable.pageIndex + 1;
  this.mainfilter.PageSize = variable.pageSize;
  this.reload();
}
search() {
  this.reload();
  this.mainfilter.SearchTerm = '';
}
reload() {
  const _this = this;
  this.isLoading = true;
  this.mainfilter.SortName = this.paginationSettings.sort.SortName;
  this.mainfilter.SortDirection = this.paginationSettings.sort.SortDirection;
  this.service.getYardsList(this.mainfilter).subscribe(
    (response: any) => {
      const list = response.results ? response.results : [];
  this.Total = (response && response.rowCount) ? response.rowCount : 0;
  this.firstRowOnPage = (response && response.firstRowOnPage) ? response.firstRowOnPage : 0;
      setTimeout(() => {
        _this.yardsList = (list) ? list : [];
        _this.isLoading = false;
      }, 500);
    },
    (err: any) => {
      _this.yardsList = [];
      _this.isLoading = false;
    }
);
}
add() {
  this.edit(null);
}

edit(Id: null | number) {
  const _this = this;
  const modalRef = this.modalService.open(YardEditComponent, { size: 'lg' });
  modalRef.componentInstance.popup = true;
  modalRef.componentInstance.id = Id;
  modalRef.result.then(function (result) {
    _this.reload();
  });
}
doNothing(): void {}
openImport() {
  const _this = this;
  const modalRef = this.modalService.open(YardImportComponent, { size: 'lg' });
  modalRef.result.then(function(importModel: any){
  });
}

downloadTemplate() {
  var fileName = 'Yards_Import.xlsx';
  var a = document.createElement('a');
  a.href = this.service.getTemplate(fileName);
  a.download = fileName;
  document.body.append(a);
  a.click();
  a.remove();
}

displayCentralFn(central: any) {
  return central && central.centralName && !central.notfound ? central.centralName : '';
}

displayAreasFn(area: any) {
  return area && area.areaName && !area.notfound ? area.areaName : '';
}

changeCentral(centralID: number) {
  this.areaFilter.CentralId = centralID;
    this.areaService.getAreasList(this.areaFilter).subscribe((response: any) => {
      this.areaFilter = response.results;
    });
  }
changeAreas(areaID: number) {
    this.mainfilter.AreaId = areaID;
    this.reload();
  }
}

