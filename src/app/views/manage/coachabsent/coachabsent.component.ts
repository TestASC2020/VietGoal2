import { Component, OnInit } from '@angular/core';
import { ASCSort, SORD_DIRECTION } from 'app/models/sort';
import { UtilsService } from 'app/services/utils.service';
import PerfectScrollbar from 'perfect-scrollbar';
import { CoachAbsentService } from 'app/services/manage/coachabsent.service';
import { CoachAbsentEditComponent } from './coachabsent-edit/coachabsent-edit.component';
import { CoachAbsentImportComponent } from './coachabsent-import/coachabsent-import.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from 'app/shared/modal/confirm/confirm.component';
import { CoachAbsentMapping } from 'app/models/manage/coachabsent';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker/typings/datepicker-input';
import { startWith, map, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApproveComponent } from './approve/approve.component';

@Component({
  selector: 'app-coachabsent',
  templateUrl: './coachabsent.component.html',
  styleUrls: ['./coachabsent.component.scss']
})
export class CoachAbsentComponent implements OnInit {
  statusControl = new FormControl();
	coachAbsentStatuses = [
		{
			id: 0,
      name: 'Chưa duyệt',
      value: 'WaitApprove'
		},
		{
			id: 1,
      name: 'Đã duyệt',
      value: 'Approved'
		},
		{
			id: 2,
      name: 'Bỏ duyệt',
      value: 'Disapproved'
		}
	];
  filteredStatuses: Observable<any>;
  

  searchTerm: string = '';
  pageIndex: number = 1;
  pageSizesList: number[] = [5, 10, 20, 100];
  pageSize: number = this.pageSizesList[3];
  Total: number;

  toDate: Date;
  fromDate: Date;
  originMin: Date;
  originMax: Date;

  coachAbsentStatusName: string;
  coachId:number;
  searchAdvanced: boolean = false;
  

  paginationSettings: any = {
    sort: new ASCSort(),
    sortToggles: [
      null,
      SORD_DIRECTION.ASC, SORD_DIRECTION.ASC, SORD_DIRECTION.ASC, SORD_DIRECTION.ASC,
      SORD_DIRECTION.ASC,
      null
    ],
    columnsName: ['Order', 'CoachRegistried', 'AbsentDate', 'ShiftType', 'Status', 'Reason', 'Action'],
    columnsNameMapping: ['id', 'coachFullName', 'coachAbsentDate', 'shiftTypeName', 'coachAbsentStatusName', 'coachAbsentReason', ''],
    columnsNameFilter: ['id', 'coachId', 'coachAbsentDate', 'shiftType', 'coachAbsentStatus', 'coachAbsentReason', ''],
    sortAbles: [false, true, true, true, true, true, false],
    visibles: [true, true, true, true, true, true, true]
  }
  // chưa dịch
  
  currentUser: any;

  coachabsentsList: any[];
  loading: boolean;
  firstRowOnPage: any;
  searchCoachesCtrl = new FormControl();
  listcoaches: any[];
  isLoading: boolean;

  constructor(public utilsService: UtilsService, private service: CoachAbsentService, private modalService: NgbModal, private http: HttpClient) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

      utilsService.loadPaginatorLabels();
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      this.fromDate = new Date(currentYear - 20, 0, 1);
      this.toDate = new Date(currentYear + 1, 11, 31);
      this.originMin = new Date(currentYear, currentMonth - 6,1);
      this.originMax = new Date(currentYear + 1, 11, 31);
  }
  
	displayCoachFn(coach): string {
	  return coach && coach.firstName +' '+ coach.lastName && !coach.notfound ? coach.firstName +' '+ coach.lastName : '';
	}
	displayStatusFn(st){
		return (st && st.name) ? st.name : '';
	}
  statusChanged(changedValue){
    this.coachAbsentStatusName = changedValue;
  }
	changeCoach(coachid){
		this.coachId = coachid;
  }
  dateEvent(type: string, event: MatDatepickerInputEvent<Date>){
    const theDate = event.value;
    switch(type){
      case 'start':
        this.fromDate = theDate;
        break;
      case 'end':
        this.fromDate = event.value;
        break;
    }
  }
  approve(absent){
    var message, state;
    if(absent){
      switch(absent.coachAbsentStatusName){
        case 'WaitApprove':
        case 'Disapproved':
          message = 'Duyệt Huấn luyện viên này';
          state = 'Approve';
          break;
        case 'Approved':
          message = 'Bỏ duyệt Huấn luyện viên này';
          state = 'DisApprove';
          break;
      }
    }
    const modalRef = this.modalService.open(ApproveComponent, { windowClass: 'modal-confirm' });
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.decide.subscribe(() => {
      this.service.toggleApprove(state,absent.id).subscribe(()=>{
        this.reload();
      });
    });
  }
  pageEvent(pageE: any) {
    this.pageIndex = pageE.pageIndex + 1;
    this.pageSize = pageE.pageSize;
    this.reload();
  }
  search(){
    this.reload();
  }
  reload() {
    const _this= this;
    const filter = {
      fromDate: this.utilsService.stringDate(this.fromDate),
      toDate: this.utilsService.stringDate(this.toDate),
      coachAbsentStatus: this.coachAbsentStatusName ? this.coachAbsentStatusName : '',
      coachId: this.coachId ? this.coachId : '',
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      sortName: this.paginationSettings.sort.SortName,
      sortDirection: this.paginationSettings.sort.SortDirection
    };

    this.loading = true;
    this.coachabsentsList = [];
    this.service.getList(filter).subscribe((response: any) => {
      const list = response.results ? response.results : [];
      this.Total = (response && response.rowCount) ? response.rowCount : 0;
      this.firstRowOnPage = (response && response.firstRowOnPage) ? response.firstRowOnPage : 0;
      setTimeout(() => {
        this.loading = false;
        this.coachabsentsList = list || [];
      }, 500);
    });
  }
  add() {
    this.edit(null);
  }
  
  edit(coachabsentId: null | number) {
    const _this = this;
    const modalRef = this.modalService.open(CoachAbsentEditComponent, { size: 'lg' });
    modalRef.componentInstance.popup = true;
    modalRef.componentInstance.coachabsentId = coachabsentId;
    modalRef.result.then(function (result) {
      _this.reload();
    });
  }
  ngOnInit() {
      this.reload();
      const vgscroll = <HTMLElement>document.querySelector('.vg-scroll');
      new PerfectScrollbar(vgscroll);
      
      this.filteredStatuses = this.statusControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value))
      );

      
		this.searchCoachesCtrl.valueChanges.pipe(
			startWith(''),
			debounceTime(500),
			tap(() => {
			  this.listcoaches = [];
			  this.isLoading = true;
			}),
			switchMap(value => this.http.get(`${environment.serverUrl}Coachs/GetCoachSelect?searchTerm=${value}&pageIndex=1&pageSize=20`)
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
				this.listcoaches = [{ notfound: 'Not Found' }];
			  } else {
				this.listcoaches = data && data.length ? data : [{ notfound: 'Not Found' }];
			  }
	  
			});
  }
  
	private _filter(value: string) {
		const filterValue = this._normalizeValue(value);
		let b = this.coachAbsentStatuses.filter(status => this._normalizeValue(status.name).includes(filterValue));
		return b;
	}

	private _normalizeValue(value: string): string {
		return value.toLowerCase().replace(/\s/g, '');
	}
  remove(id: any) {
    const _this = this;
    const modalRef = this.modalService.open(ConfirmComponent, { windowClass: 'modal-confirm' });
    modalRef.componentInstance.confirmObject = 'CoachAbsent';
    modalRef.componentInstance.decide.subscribe(() => {
      _this.service.delete(id).subscribe(()=>{
        _this.reload();
      });
    });
  }

  openImport() {
    const _this = this;
    const modalRef = this.modalService.open(CoachAbsentImportComponent, { size: 'lg' });
    modalRef.result.then(function(importModel: any){
        console.log(importModel);
    });
  }
  
  approveColor(absentItem){
    if (absentItem.coachAbsentStatusName == 'Approved') {
      return 'btn btn-danger btn-link btn-sm delete-button btn-just-icon' ;
    } else {
      return 'btn btn-primary edit-button btn-link btn-sm btn-just-icon';
    }
  }

  downloadTemplate() {
    // var fileName = 'Yards_Import.xlsx';
    // var a = document.createElement('a');
    // a.href = this.service.getTemplate(fileName);
    // a.download = fileName;
    // document.body.append(a);
    // a.click();
    // a.remove();
  }


    sortToggles(colIndex: number) {
    const _this= this;
        if(this.paginationSettings.sortAbles[colIndex]) 
            this.utilsService.toggleSort(colIndex, this.paginationSettings.sortToggles ,this.paginationSettings.sort , this.paginationSettings.columnsNameFilter)
              .then(() => {
                _this.reload();
              });
        else 
          this.utilsService.doNothing();
    }
}
