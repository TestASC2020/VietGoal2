import { Component, OnInit, ViewChild} from '@angular/core';
import { WardService } from '../../../services/list/ward.service';
import { DistrictService } from '../../../services/list/district.service';
import { ProvinceService } from '../../../services/list/province.service';
import { Ward } from '../../../models/list/wards';
import { WardFilter } from '../../../models/filter/wardfilter';
import { Filter } from '../../../models/filter/filter';
import { DistrictFilter } from '../../../models/filter/districtfilter';
import { Router } from '@angular/router'; 
import { WardEditComponent } from './wardedit/wardedit.component';
import { ConfirmComponent } from '../../../shared/modal/confirm/confirm.component';
import { ASCSort, SORD_DIRECTION } from 'app/models/sort';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { WardImportComponent } from './wards-import/ward-import.component';
import { Province } from 'app/models/list/province';
import { District } from 'app/models/list/districts';

import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-wards',
  templateUrl: './wards.component.html',
  styleUrls: ['./wards.component.scss']
})
export class WardsComponent implements OnInit {
  wardsList:any[] = [];
  provincesList:any[] = [];
  districtsList:any[] = [];
  ward: any;
  searchTerm:string = '';
  pageIndex:number = 1;
  pageSizesList: number[] = [5, 10, 20, 100];
  pageSize:number = this.pageSizesList[1];
  currentUser: any;
  isLoading: boolean = true;
  firstRowOnPage: any;
  provinceId: null | number = null;
  districtId: null | number = null;


  searchProvincesCtrl = new FormControl();
  searchDistrictsCtrl = new FormControl();

  /**
   * BEGIN SORT SETTINGS
   */
  sort: ASCSort = new ASCSort();
  sortToggles: SORD_DIRECTION[] = [null, SORD_DIRECTION.ASC, SORD_DIRECTION.ASC, SORD_DIRECTION.ASC, null];
  columnsName: string[] = ['Order', 'WardCode', 'WardName',  'DistrictName', 'Action'];
  columnsNameMapping: string[] = ['ID', 'WardCode', 'WardName',  'DistrictName', 'Action'];
  sortAbles: boolean[] = [false, true, true, true, false];
  /**
   * END SORT SETTINGS
   */

   filter: WardFilter = new WardFilter( this.searchTerm,this.pageIndex, this.pageSize,null,null, 'Id','ASC');
   districtFilter: DistrictFilter = new DistrictFilter( this.searchTerm,this.pageIndex, this.pageSize,null,null, 'Id','ASC');
   provinceFilter: Filter = new Filter( this.searchTerm,this.pageIndex, this.pageSize, 'Id','ASC');

  constructor(private translate: TranslateService, private service: WardService, private provinceService: ProvinceService, private districtService: DistrictService, private router: Router,
    private matCus: MatPaginatorIntl,config: NgbModalConfig,
    private modalService: NgbModal) { 
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

  remove(ward: Ward) {
    this.ward = ward;
    const _this = this;
    const modalRef = this.modalService.open(ConfirmComponent, { windowClass: 'modal-confirm' });
    modalRef.componentInstance.confirmObject = 'Wards';
    modalRef.componentInstance.decide.subscribe(() => {
        _this.deleteWard();
    });
}

pageEvent(variable: any){
  this.pageIndex = variable.pageIndex+1;
  this.pageSize = variable.pageSize;
  this.reload();
}

reload() {
  const _this = this;
  this.isLoading = true;
  _this.provincesList = [];
  this.provinceService.getProvincesList(this.provinceFilter).subscribe(
      (response: any) => {
        const list = response.results ? response.results : [];
        this.firstRowOnPage = (response && response.firstRowOnPage) ? response.firstRowOnPage : 0;
        setTimeout(() => {
          _this.provincesList = (list) ? list : [];
          _this.districtsList = [];
          this.districtService.getDistrictsList(this.districtFilter).subscribe(
              (response: any) => {
                const list = response.results ? response.results : [];
                this.firstRowOnPage = (response && response.firstRowOnPage) ? response.firstRowOnPage : 0;
                setTimeout(() => {
                  _this.districtsList = (list) ? list : [];
                  _this.wardsList = [];
                  this.service.getWardsList(this.filter).subscribe(
                      (response: any) => {
                        const list = response.results ? response.results : [];
                        this.firstRowOnPage = (response && response.firstRowOnPage) ? response.firstRowOnPage : 0;
                        setTimeout(() => {
                          _this.wardsList = (list) ? list : [];
                          _this.isLoading = false;
                        }, 500);
                      },
                      (err: any) => {
                        _this.wardsList = [];
                        _this.isLoading = false;
                      }
                  );
                }, 500);
              },
              (err: any) => {
                _this.districtsList = [];
                _this.isLoading = false;
              }
          );

        }, 500);
      },
      (err: any) => {
        _this.provincesList = [];
        _this.isLoading = false;
      }
  );
}

  add() {
    this.edit(null);
  }

  edit(ID: null | number) {
    const _this = this;
    const modalRef = this.modalService.open(WardEditComponent, { size: 'lg' });
    modalRef.componentInstance.popup = true;
    if (ID) {
      modalRef.componentInstance.ID = ID;
      modalRef.componentInstance.UserId = _this.currentUser.UserId;
    }
    modalRef.result.then(function(){
      _this.reload();
  });
  }

  deleteWard() {
    const _this = this;
    this.service.deleteWard(this.ward.Id, this.currentUser.UserID).subscribe((rs:any)=>{
      this.reload();
    }); 
  }
  
  toggleSort(columnIndex: number): void {
    let toggleState =  this.sortToggles[columnIndex];
    switch(toggleState) {
      case SORD_DIRECTION.ASC: 
      {
        toggleState = SORD_DIRECTION.ASC;
        break;
      }
      case SORD_DIRECTION.ASC: 
      {
        toggleState = SORD_DIRECTION.DESC;
        break;
      }
      default:
      {
        toggleState = SORD_DIRECTION.ASC;
        break;
      }
    }
    this.sortToggles.forEach((s: string, index: number) => {
      if(index == columnIndex) {
        this.sortToggles[index] = this.sort.SortDirection = toggleState;
      } else {
        this.sortToggles[index] = SORD_DIRECTION.ASC;
      }
    });

    this.sort.SortName = (toggleState == SORD_DIRECTION.ASC) ? 'ID' : this.columnsNameMapping[columnIndex];
    this.reload();
  }
  
  doNothing(): void {}
  
  openImport() {
    const _this = this;
    const modalRef = this.modalService.open(WardImportComponent, { size: 'lg' });
    modalRef.result.then(function(importModel: any){
        console.log(importModel);
    });
  }

  downloadTemplate() {
    var fileName = 'Districts_Import.xlsx';
    var a = document.createElement('a');
    a.href = this.service.getTemplate(fileName);
    a.download = fileName;
    document.body.append(a);
    a.click();
    a.remove();
  }

displayProvinceFn(province: any) {
    return province && province.ProvinceName && !province.notfound ? province.ProvinceName : '';
  }

changeProvince(provinceId: number) {
    this.districtFilter.ProvinceId = provinceId;
    this.districtService.getDistrictsList(this.districtFilter).subscribe((list) => {
      this.districtsList = list;
      this.reload();
    });
  }

  displayDistrictFn(district: any) {
    return district && district.DistrictName && !district.notfound ? district.DistrictName : '';
  }

changeDistrict(districtId: number) {
    this.filter.DistrictId = districtId;
    this.service.getWardsList(this.filter).subscribe((list) => {
      this.wardsList = list;
      this.reload();
    });
  }
}
