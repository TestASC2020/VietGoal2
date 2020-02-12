import { Component, OnInit} from '@angular/core';
import { DistrictService } from '../../../services/danhmuc/district.service';
import { ProvinceService } from '../../../services/danhmuc/province.service';
import { District } from '../../../models/danhmuc/districts';
import { DistrictFilter } from '../../../models/filter/districtfilter';
import { Router } from '@angular/router'; 
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DistrictEditComponent } from './districtedit/districtedit.component';
import { UtilsService } from '../../../services/utils.service';
import { ConfirmComponent } from '../../../shared/modal/confirm/confirm.component';
import { Province } from 'app/models/danhmuc/province';
import { Filter } from 'app/models/filter/filter';
import { ASCSort, SORD_DIRECTION } from 'app/models/sort';
@Component({
  selector: 'app-districts',
  templateUrl: './districts.component.html',
  styleUrls: ['./districts.component.scss']
})
export class DistrictsComponent implements OnInit {
  districtsList:District[] = [];
  district: District;
  searchTerm:string = '';
  pageIndex:number = 1;
  pageSize:number = 20;
  currentUser: any;

  /**
   * BEGIN SORT SETTINGS
   */
  sort: ASCSort = new ASCSort();
  sortToggles: SORD_DIRECTION[] = [null, SORD_DIRECTION.DEFAULT, SORD_DIRECTION.DEFAULT, SORD_DIRECTION.DEFAULT, null];
  columnsName: string[] = ['Order', 'DistrictCode', 'DistrictName', 'ProvinceName', 'Action'];
  columnsNameMapping: string[] = ['ID', 'DistrictCode', 'DistrictName', 'ProvinceName', 'Action'];
  sortAbles: boolean[] = [false, true, true, true, false];
  /**
   * END SORT SETTINGS
   */

  constructor(public util: UtilsService, private service: DistrictService, private router: Router, private modalService: NgbModal) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	  this.reload();
  }

  remove(district: District) {
    this.district = district;
    const _this = this;
    const modalRef = this.modalService.open(ConfirmComponent, { size: 'lg' });
    modalRef.componentInstance.confirmObject = 'District';
    modalRef.componentInstance.decide.subscribe(() => {
        _this.deleteDistrict();
    });
}

  reload() {
    const _this = this;
    const filter: DistrictFilter = new DistrictFilter(this.searchTerm, this.pageIndex, this.pageSize, null, this.sort.SortName, this.sort.SortDirection);
    _this.service.getDistrictsList(filter).subscribe((districtList: District[]) => {
      _this.districtsList = districtList;
    });
  }

  add() {
    this.edit(null);
  }

  edit(ID: null | number) {
    const _this = this;
    console.log(_this.currentUser.UserId);
    const modalRef = this.modalService.open(DistrictEditComponent, { size: 'lg' });
    modalRef.componentInstance.popup = true;
    if (ID) {
      modalRef.componentInstance.ID = ID;
      modalRef.componentInstance.UserId = _this.currentUser.UserId;
    }
    modalRef.result.then(function(){
      _this.reload();
  });
  }

  deleteDistrict() {
    const _this = this;
    this.service.deleteDistrict(this.district.ID, this.currentUser.UserId).subscribe((res: any) => {
      _this.reload();
    });
  }
  
  toggleSort(columnIndex: number): void {
    let toggleState =  this.sortToggles[columnIndex];
    switch(toggleState) {
      case SORD_DIRECTION.DEFAULT: 
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
        toggleState = SORD_DIRECTION.DEFAULT;
        break;
      }
    }
    this.sortToggles.forEach((s: string, index: number) => {
      if(index == columnIndex) {
        this.sortToggles[index] = this.sort.SortDirection = toggleState;
      } else {
        this.sortToggles[index] = SORD_DIRECTION.DEFAULT;
      }
    });

    this.sort.SortName = (toggleState == SORD_DIRECTION.DEFAULT) ? 'ID' : this.columnsNameMapping[columnIndex];
    this.reload();
  }
  
  doNothing(): void {}
}
