/**
 * Begin import system requirements
 * **/
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../../../shared/modal/confirm/confirm.component';
import { HttpClient } from '@angular/common/http';
import { debounceTime, tap, switchMap, finalize, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
/**
 * End import system requirements
 * **/

/**
 * Begin import services
 * **/
import { ClassService } from '../../../../services/manage/class.service';
import { ProvinceService } from '../../../../services/list/province.service';
import { DistrictService } from '../../../../services/list/district.service';
import { WardService } from '../../../../services/list/ward.service';
import { UserService } from '../../../../services/acl/user.service';
import { AgeService } from '../../../../services/list/age.service';
import { Filter } from '../../../../models/filter/filter';

import { DistrictFilter } from '../../../../models/filter/districtfilter';
import { WardFilter } from '../../../../models/filter/wardfilter';
import { Week, WeekToList, WeekToListName } from '../../../../models/enums/week.enums';
import { ShiftDay, ShiftDayToList, ShiftDayToListName } from '../../../../models/enums/shiftday.enums';
import { RecruitStudentService } from '../../../../services/manage/recruit-student.service';
import { StudentService } from '../../../../services/manage/student.service';
import { RecruitStudent } from '../../../../models/manage/recruit-student';
/**
 * End import services
 * **/

@Component({
	selector: 'app-recruit-student-edit',
	templateUrl: './recruit-student-edit.component.html',
	styleUrls: ['./recruit-student-edit.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class RecruitStudentEditComponent implements OnInit {
	@Input('popup') popup: boolean;
	@Input('id') id: number;
	@Output() capNhatThanhCong: EventEmitter<any> = new EventEmitter();
	currentUser: any = {};
	provincesList: any[] = [];
	districtsList: any[] = [];
	wardsList: any[] = [];
	agesList: any[] = [];
	managersList: any[] = [];
	mainCoachsList: any[] = [];
	viceCoachsList: any[] = [];
	student: any;
	searchProvincesCtrl = new FormControl();
	searchDistrictsCtrl = new FormControl();
	searchWardsCtrl = new FormControl();
	searchAgesCtrl = new FormControl();
	searchManagersCtrl = new FormControl();
	searchMainCoachsCtrl = new FormControl();
	searchViceCoachsCtrl = new FormControl();
	recruitstudent : any[] ;
	isLoading = false;
	errorMsg: string;

	constructor(public activeModal: NgbActiveModal, config: NgbModalConfig, private modalService: NgbModal,
		private studentService: StudentService,
		private studentrecruitService: RecruitStudentService,
		private provinceService: ProvinceService,
		private districtService: DistrictService,
		private wardService: WardService,
		private userService: UserService,
		private ageService: AgeService,
		private route: ActivatedRoute, private router: Router, private http: HttpClient) {
		this.id = this.route.snapshot.queryParams['id'];
		this.id = (this.id) ? this.id : 0;
		config.backdrop = 'static';
		config.keyboard = false;
		config.scrollable = false;
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

		// this.getProvince();
	}
	filter:	Filter = new Filter ('', 1, 100, 'id', 'ASC');
	districtfilter:	DistrictFilter = new DistrictFilter ('', 1, 100,null, 'id', 'ASC');
	wardfilter: WardFilter = new WardFilter ('', 1, 100,null,null, 'id', 'ASC');

	displayProvinceFn(user): string {
		return user && user.ProvinceName && !user.notfound ? user.ProvinceName : '';
	}
	displayDistrictFn(user): string {
		return user && user.DistrictName && !user.notfound ? user.DistrictName : '';
	}
	displayWardFn(user): string {
		return user && user.WardName && !user.notfound ? user.WardName : '';
	}
	changeProvince(provinceID) {
		this.districtService.getDistrictsList(new DistrictFilter('', 1, 100, 0, 'id','ASC')).subscribe((list) => {
			this.districtsList = list;
		});
	}
	changeDistrict(districtID) {
		this.wardService.getWardsList(new WardFilter('', 1, 100, 0, 0,'id','ASC')).subscribe((list) => {
			this.wardfilter = list;
		});
	}
	changeWard(wardID) {
		this.student.wardId = wardID;
	}
	GetStudentById(Id: number) {
		this.studentService.get((Id) ? Id : this.id).subscribe(
			(stu: any) => {
				this.student = stu || {};
			},
			() => {
				this.student = {};
			}
		);
	}
	ngOnInit() {
		this.searchProvincesCtrl.valueChanges
			.pipe(
				startWith(''),
				debounceTime(500),
				tap(() => {
					this.errorMsg = "";
					this.provincesList = [];
					this.isLoading = true;
				}),
				switchMap(value => this.provinceService.getProvincesList(new Filter(value, 1, 100, 'id', 'ASC'))
					.pipe(
						finalize(() => {
							this.isLoading = false
						}),
					)
				)
			)
			.subscribe(data => {
				if (data == undefined) {
					this.errorMsg = 'error';
					this.provincesList = [{ notfound: 'Not Found' }];
				} else {
					this.errorMsg = "";
					this.provincesList = data.length ? data : [{ notfound: 'Not Found' }];
				}

			});

		this.searchDistrictsCtrl.valueChanges.pipe(
			startWith(''),
			debounceTime(500),
			tap(() => {
				this.errorMsg = "";
				this.districtsList = [];
				this.isLoading = true;
			}),
			switchMap(value => this.districtService.getDistrictsList(new DistrictFilter(value, 1, 100, null, 'id', 'ASC'))
				.pipe(
					finalize(() => {
						this.isLoading = false
					}),
				)
			)
		).subscribe(data => {
			if (data == undefined) {
				this.errorMsg = 'error';
				this.districtsList = [{ notfound: 'Not Found' }];
			} else {
				this.errorMsg = "";
				this.districtsList = data.length ? data : [{ notfound: 'Not Found' }];
			}
		});

		this.searchWardsCtrl.valueChanges.pipe(
			startWith(''),
			debounceTime(500),
			tap(() => {
				this.errorMsg = "";
				this.wardsList = [];
				this.isLoading = true;
			}),
			switchMap(value => this.wardService.getWardsList(new WardFilter(value, 1, 100, 0, 0, 'id', 'ASC'))
				.pipe(
					finalize(() => {
						this.isLoading = false
					}),
				)
			)
		).subscribe(data => {
			if (data == undefined) {
				this.errorMsg = 'error';
				this.wardsList = [{ notfound: 'Not Found' }];
			} else {
				this.errorMsg = "";
				this.wardsList = data.length ? data : [{ notfound: 'Not Found' }];
			}

		});
		this.GetStudentById(this.id);
	}
	ReturnList() {
		this.router.navigate(['quanly/recruit-student']);

	}
	UpdateRecruitStudent() {
		const _this = this;
		 this.studentService.addOrUpdate(_this.student).subscribe((result : any)=>{
			if (result) {
				if(!_this.popup) {
					
					_this.ReturnList();
				} else {
				
					_this.closeMe();
				}
			} else {
				const modalRef = _this.modalService.open(ConfirmComponent, { size: 'lg' });
			}
		 });
	}
	closeMe() {
		this.activeModal.close();
	}
}
