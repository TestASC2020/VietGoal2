import { Component, OnInit, AfterViewInit, ViewChild, Input, Output , ChangeDetectorRef, EventEmitter, ViewEncapsulation } from '@angular/core';
import { WardService } from '../../../../services/list/ward.service';
import { Ward } from '../../../../models/list/wards';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../../../shared/modal/confirm/confirm.component';
import { DistrictService } from '../../../../services/list/district.service';
import { District } from '../../../../models/list/districts';
import { DistrictFilter } from '../../../../models/filter/districtfilter';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { SORD_DIRECTION } from "../../../../models/sort";
import { FormControl } from '@angular/forms';

@Component({
	selector: 'app-ward-edit',
	templateUrl: './wardedit.component.html',
	styleUrls: ['./wardedit.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class WardEditComponent implements OnInit, AfterViewInit {
	@Input('popup') popup: boolean;
	@Input('Id') Id: number;
	@Input('UserId') UserId: null | number;
	ward: Ward = new Ward(0, '', '', 0,false, new Date(), null, 1, null, null, null);

	/**
	*  Search with autocomplete
	* ---------------------------
	*/

	/**
	* District
	*/
	searchDistrictsCtrl = new FormControl();
  	filteredDistricts: any;

	/**
	* ---------------------------
	*/

  	isLoading = false;

	constructor(private cd: ChangeDetectorRef, private districtService: DistrictService,public activeModal: NgbActiveModal, config: NgbModalConfig, private modalService: NgbModal, private wardService: WardService, private route: ActivatedRoute, private router: Router) {
		this.Id = this.route.snapshot.queryParams['Id'];
		this.Id = (this.Id) ? this.Id : 0;
		config.backdrop = 'static';
     	config.keyboard = false;
		config.scrollable = false;
	}  


	GetWardById(Id:number)  
	{  
		
		const _this = this;
	}

	ngAfterViewInit() {
        this.cd.detectChanges();
    }

	ngOnInit() {
		const _this = this;
		this.searchDistrictsCtrl.valueChanges
		  .pipe(
	        debounceTime(300),
	        tap(() => this.isLoading = true),
	        switchMap(value => _this.districtService.getDistrictsList(new DistrictFilter(value, 1, 10000, null, 'DistrictName', SORD_DIRECTION.ASC))
	        .pipe(
	          finalize(() => this.isLoading = false),
	          )
	        )
	      )
	      .subscribe(data => {
	      	if (data == undefined || data == null) {
	          _this.filteredDistricts = [];
	        } else {
	          _this.filteredDistricts = data;
	        }
	        _this.checkDistricts();
	      });
		this.GetWardById(this.Id);  
	}

	ReturnList() {
		this.router.navigate(['danhmuc/phuongxa']); 

	}

	UpdateWard() {
		const _this = this;
		 this.wardService.addOrUpdateWard(_this.ward, this.UserId).subscribe((result : any)=>{
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

	displayFn(district: District) {
		if (district) {
			return district;
		}
		return null;
	}

	updateSelectedDistrict(event: any) {
		const selectedDistricts = this.filteredDistricts.filter((district: District) => district.DistrictName == event.option.value);
		if(selectedDistricts.length > 0) {
			this.ward.DistrictId = selectedDistricts[0].Id;
			console.log(this.ward);
		}
	}

	checkDistricts() {
		if(this.filteredDistricts.length < 1) {
			this.searchDistrictsCtrl.setValue('');
		}
	}
}