import { Component, OnInit, ViewChild } from '@angular/core';
import { UtilsService } from '../../../services/utils.service';
import { Router } from '@angular/router';

import { ConfirmComponent } from '../../../shared/modal/confirm/confirm.component';

import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ASCSort, SORD_DIRECTION } from 'app/models/sort';
import { ClassFilter } from 'app/models/filter/classfilter';
import { FormControl } from '@angular/forms';
import { startWith, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { ProvinceService } from 'app/services/list/province.service';
import { HttpClient } from '@angular/common/http';
import { YardService } from 'app/services/list/yard.service';
import { YardFilter } from 'app/models/filter/yardfilter';
import { Class } from '../../../models/manage/class';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { ClassEditComponent } from './class-edit/class-edit.component';
import PerfectScrollbar from 'perfect-scrollbar';
import { AreaService } from 'app/services/list/area.service';
import { ClassService } from 'app/services/manage/class.service';
import { TrainingGroundService } from 'app/services/list/training-ground.service';
import { TrainingGroundFilter } from 'app/models/filter/trainingroundfilter';
import { AreaFilter } from 'app/models/filter/areafilter';
import { MatPaginatorIntl } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ClassImportComponent } from './class-import/class-import.component';
import { Yard } from 'app/models/list/yard';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.scss']
})
export class ClassComponent implements OnInit {
  classList: any[] = [];
  Class: Class;
  searchTerm:string = '';
  pageIndex:number = 1;
  pageSizesList: number[] = [5, 10, 20, 100];
  pageSize:number = this.pageSizesList[1];
  currentUser: any;
  loading: boolean = true;
  Total: any;
  firstRowOnPage: any;

  areasList: any[];
  yardsList: any[]= [];
  traininggroundsList: any[]= [];

  searchAreasCtrl = new FormControl();
  searchYardsCtrl = new FormControl();
  searchTrainingGroundsCtrl = new FormControl();
  searchAdvanced: boolean = false;
  isLoading = false;
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
  columnsName: ['Order', 'ClassCode', 'ClassName', 'DisplayOrder', 'StudentCounts', 'CoachsList','YardName','Action'],
  columnsNameMapping: ['id', 'classCode', 'className', 'displayOrder', 'studentCounts', 'viceCoachList','yardName',''],
  sortAbles: [false, true, true, true, false,false,true, false],
  visibles:  [true, true, true, true, true, true,true, true]
}
  /**
   * END SORT SETTINGS
   */
  filter: ClassFilter = new ClassFilter(this.searchTerm, 1, this.pageSize, 0, 0, 0, 'id', 'ASC',0,0,0);

  constructor(private matCus: MatPaginatorIntl, private translate: TranslateService,public utilsService: UtilsService, config: NgbModalConfig, private service: ClassService,private traininggroundservice: TrainingGroundService, private router: Router, private modalService: NgbModal,
    private areaService: AreaService, private yardService: YardService, private http: HttpClient) {
    config.backdrop = 'static';
    config.keyboard = false;
    config.scrollable = false;
    utilsService.loadPaginatorLabels();
    this.updateMatTableLabel();
    translate.onLangChange.subscribe((a: any) => {
      this.updateMatTableLabel();
      matCus.changes.next();
    });
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
  ngOnInit() {
  
    
    this.reload();
    this.filtersEventsBinding();
    const vgscroll = <HTMLElement>document.querySelector('.vg-scroll');
    new PerfectScrollbar(vgscroll);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  filtersEventsBinding() {

    this.searchAreasCtrl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(500),
        tap(() => {
          this.areasList = [];
          this.isLoading = true;
        }),
        switchMap(value => this.areaService.getAreasList(new AreaFilter(value, 1, 100, 0, 'id', 'ASC'))
          .pipe(
            finalize(() => {
              this.isLoading = false
            }),
          )
        )
      )
      .subscribe((response: any) => {
        const data = response.results;
        if (data == undefined) {
          this.areasList = [{ notfound: 'Not Found' }];
        } else {
          this.areasList = data.length ? data : [{ notfound: 'Not Found' }];
        }

      });
    this.searchYardsCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(500),
      tap(() => {
        this.yardsList = [];
        this.isLoading = true;
      }),
      switchMap(value => this.yardService.getYardsList(new YardFilter(value, 1, 100, 0, 'id', 'ASC'))
        .pipe(
          finalize(() => {
            this.isLoading = false
          }),
        )
      )
    )
      .subscribe((response : any) => {
        const data = response.results;
        if (data == undefined) {
          this.yardsList = [{ notfound: 'Not Found' }];
        } else {
          this.yardsList = data.length ? data : [{ notfound: 'Not Found' }];
        }

      });
    this.searchTrainingGroundsCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(500),
      tap(() => {
        this.traininggroundsList = [];
        this.isLoading = true;
      }),
      switchMap(value => this.traininggroundservice.getTrainingGroundsList(new TrainingGroundFilter('', 1, 100, 0,0, 'id', 'ASC'))
        .pipe(
          finalize(() => {
            this.isLoading = false
          }),
        )
      )
    )
      .subscribe((response: any) => {
        const data = response.results;
        if (data == undefined) {
          this.traininggroundsList = [{ notfound: 'Not Found' }];
        } else {
          this.traininggroundsList = data.length ? data : [{ notfound: 'Not Found' }];
        }

      });
  }

  remove(id: any) {
    const _this = this;
    const modalRef = this.modalService.open(ConfirmComponent, { windowClass: 'modal-confirm' });
    modalRef.componentInstance.confirmObject = 'Class';
    modalRef.componentInstance.decide.subscribe(() => {
      _this.service.deleteClass(id).subscribe(() => {
        _this.reload();
      });
    });
  }
  pageEvent(variable: any) {
    this.filter = new ClassFilter(this.searchTerm, 1, this.pageSize, 0, 0, 0, 'id','ASC',0,0,0);
    this.filter.PageIndex = variable.pageIndex + 1;
    this.filter.PageSize = variable.pageSize;
    this.reload();
  }
  reload() {
    const _this = this;
    const filter: ClassFilter = new ClassFilter( '',this.pageIndex, this.pageSize,0,0,0, 'id','ASC',0,0,0);
    this.loading = true;
    _this.classList = [];
    this.service.getClassList(filter).subscribe(
        (response: any) => {
          const list = response.results ? response.results : [];
          this.Total = (response && response.rowCount) ? response.rowCount : 0;
          this.firstRowOnPage = (response && response.firstRowOnPage) ? response.firstRowOnPage : 0;
          setTimeout(() => {
            _this.classList = (list) ? list : [];
            _this.loading = false;
          }, 500);
        },
        (err: any) => {
          _this.classList = [];
          _this.loading = false;
        }
    );
  }
  add() {
    this.edit(null);
  }
  edit(ClassID: null | number) {
    const _this = this;
    const modalRef = this.modalService.open(ClassEditComponent, { size: 'lg' });
    modalRef.componentInstance.popup = true;
    modalRef.componentInstance.id = ClassID;
    modalRef.result.then(function (result) {
      _this.reload();
    });
  }
  displayAreaFn(area): string {
    return area && area.areaName && !area.notfound ? area.areaName : '';
  }
  displayYardFn(yard): string {
    return yard && yard.yardName && !yard.notfound ? yard.yardName : '';
  }
  displayTrainingGroundFn(trainingground: any) {
    return trainingground && trainingground.TrainingGroundName && !trainingground.notfound ? trainingground.TrainingGroundName : '';
  }
  changeArea(areaID: number) {
    this.yardService.getYardsList(new YardFilter('', 1, 100, areaID, 'id', 'ASC')).subscribe((response : any) => {
      this.yardsList = response.result;
      this.filter.AreaId = areaID;
      this.reload();
    });
  }
  changeYard(yardID) {
  this.Class.yardId = yardID;
  }
  // changeTrainingGround(traininggroundID) {
  //   this.filter.TrainingGroundId = traininggroundID;
  //   this.reload();
  // }

  doNothing(): void {}
  openImport() {
    const _this = this;
    const modalRef = this.modalService.open(ClassImportComponent, { size: 'lg' });
    modalRef.result.then(function(importModel: any){
       
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
  studentProfile(classId){
    if (classId) this.router.navigate(['quanly/hosohocsinhtheolop/'+classId]);
  }
}

