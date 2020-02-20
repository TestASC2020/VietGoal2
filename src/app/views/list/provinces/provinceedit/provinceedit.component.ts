import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation  } from '@angular/core';
import { ProvinceService } from '../../../../services/list/province.service';
import { Province } from '../../../../models/list/province';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../../../shared/modal/confirm/confirm.component';

@Component({
	selector: 'app-province-edit',
	templateUrl: './provinceedit.component.html',
	styleUrls: ['./provinceedit.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class ProvinceEditComponent implements OnInit {
	@Input('popup') popup: boolean;
	@Input('ID') ID: null | number;
	currentUser: any;

	province: Province = new Province(0, '', '', false, new Date(), null, 1, null, null, null);

	constructor(public activeModal: NgbActiveModal, config: NgbModalConfig, private modalService: NgbModal, private provinceService: ProvinceService, private route: ActivatedRoute, private router: Router) {
		this.ID = this.route.snapshot.queryParams['ID'];
		config.backdrop = 'static';
     	config.keyboard = false;
		config.scrollable = false;
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	}  
	GetProvinceById(ID: number)  
	{  
		const _this = this;
		if(ID){
			this.provinceService.getProvince(ID).subscribe((province: Province) => {
				_this.province = province;
				if (_this.province == null || _this.province.Id == null) {
					_this.province = new Province(0, '', '', false, new Date(), null, 1, null, null, null);
				}
			});
		} else {
			_this.province = new Province(0, '', '', false, new Date(), null, 1, null, null, null);
		}
	}
	ngOnInit() {
		this.GetProvinceById(this.ID);  
	}

	ReturnList() {
		this.router.navigate(['danhmuc/tinhthanh']); 
	}

	UpdateProvince() {
		const _this = this;
		this.provinceService.addOrUpdateProvince(_this.province, this.currentUser.UserId).subscribe((result: any) => {
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