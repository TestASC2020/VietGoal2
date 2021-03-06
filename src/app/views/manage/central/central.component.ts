import { Component, OnInit } from '@angular/core';
import { Central } from '../../../models/manage/central';
import { CentralService } from '../../../services/manage/central.service';
import { UtilsService } from '../../../services/utils.service';

import { ConfirmComponent } from '../../../shared/modal/confirm/confirm.component';

import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ASCSort, SORD_DIRECTION } from 'app/models/sort';
import { FormControl } from '@angular/forms';
import { startWith, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { ProvinceService } from 'app/services/list/province.service';
import { DistrictService } from 'app/services/list/district.service';
import { CentralEditComponent } from './central-edit/central-edit.component';
import PerfectScrollbar from 'perfect-scrollbar';
import { CentralImportComponent } from './central-import/central-import.component';
import { CommonFilter } from 'app/models/filter/commonfilter';
import { WardService } from 'app/services/list/ward.service';

@Component({
  selector: 'app-Central',
  templateUrl: './central.component.html',
  styleUrls: ['./central.component.scss']
})
export class CentralComponent implements OnInit {
  CentralList: any[] = [];
  Central: Central;
  searchTerm: string = '';
  pageSizesList: number[] = [5, 10, 20, 100];
  filter: CommonFilter = new CommonFilter();
  pageSizeFilter: number = 20;
  searchAdvanced = false;
  currentUser: any;
  Total: number;
  listprovince: any;
  listdistrict: any;
  listward: any;
  loading: boolean;
  searchProvincesCtrl = new FormControl();
  searchDistrictsCtrl = new FormControl();
  searchWardsCtrl = new FormControl();
  provinceId: any = '';
  districtId: any = '';

  isLoading = false;
  /**
  * BEGIN SORT SETTINGS
  */
  paginationSettings: any = {
    sort: new ASCSort(),
    sortToggles: [
      null,
      SORD_DIRECTION.ASC, SORD_DIRECTION.ASC, SORD_DIRECTION.ASC, SORD_DIRECTION.ASC,
      null
    ],
    columnsName: ['Order', 'CentralName', 'Address', 'CampusArea', 'Note', 'Action'],
    columnsNameMapping: ['id', 'centralName', 'address', 'area', 'description', 'Action'],
    sortAbles: [false, true, true, true, true, false],
    visibles: [true, true, true, true, true, true]
  }
  /**
   * END SORT SETTINGS
   */
  firstRowOnPage: any;

  constructor(public utilsService: UtilsService, config: NgbModalConfig, private service: CentralService, private modalService: NgbModal,
    private provinceService: ProvinceService, private districtService: DistrictService, private wardService: WardService) {
    config.backdrop = 'static';
    config.keyboard = false;
    config.scrollable = false;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    utilsService.loadPaginatorLabels();
  }
  ngOnInit() {

    this.filter.SearchTerm = '';
    this.filter.PageIndex = 1;
    this.filter.PageSize = this.pageSizesList[1];
    this.reload();
    this.filtersEventsBinding();
    const vgscroll = <HTMLElement>document.querySelector('.vg-scroll');
    new PerfectScrollbar(vgscroll);
  }

  pageEvent(variable: any) {
    this.filter.PageIndex = variable.pageIndex + 1;
    this.filter.PageSize = variable.pageSize;
    this.reload();
  }
  search(){
    this.reload();
    this.filter.searchTerm = '';
  }
  reload() {
    this.filter.sortName = this.paginationSettings.sort.SortName;
    this.filter.sortDirection = this.paginationSettings.sort.SortDirection;

    this.loading = true;
    this.CentralList = [];
    this.service.getCentralsList(this.filter).subscribe((response: any) => {
      const list = response.results ? response.results : [];
      this.Total = (response && response.rowCount) ? response.rowCount : 0;
      this.firstRowOnPage = (response && response.firstRowOnPage) ? response.firstRowOnPage : 0;
      setTimeout(() => {
        this.loading = false;
        this.CentralList = list || [];
      }, 500);
    });
  }
  add() {
    this.edit(null);
  }

  edit(CentralId: null | number) {
    const _this = this;
    const modalRef = this.modalService.open(CentralEditComponent, { size: 'lg' });
    modalRef.componentInstance.popup = true;
    modalRef.componentInstance.CentralId = CentralId;
    modalRef.result.then(function () {
      _this.reload();
    });
  }
  remove(id) {
    const _this = this;
    const modalRef = this.modalService.open(ConfirmComponent, { windowClass: 'modal-confirm' });
    modalRef.componentInstance.confirmObject = 'Central';
    modalRef.componentInstance.decide.subscribe(() => {
      _this.service.deleteCentral(id).subscribe(() => {
        _this.reload();
      });
    });
  }


  openImport() {
    const modalRef = this.modalService.open(CentralImportComponent, { size: 'lg' });
    modalRef.result.then(function (importModel: any) {
      console.log(importModel);
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
  sortToggles(colIndex: number) {
    const _this = this;
    if (this.paginationSettings.sortAbles[colIndex])
      this.utilsService.toggleSort(colIndex, this.paginationSettings.sortToggles, this.paginationSettings.sort, this.paginationSettings.columnsNameMapping)
        .then(() => {
          _this.reload();
        });
    else
      this.utilsService.doNothing();
  }
  // Autocomplete part
  displayProvinceFn(user): string {
    return user && user.provinceName && !user.notfound ? user.provinceName : '';
  }
  displayDistrictFn(user): string {
    return user && user.districtName && !user.notfound ? user.districtName : '';
  }
  displayWardFn(user): string {
    return user && user.wardName && !user.notfound ? user.wardName : '';
  }
  changeProvince(provinceID) {
    this.provinceId = provinceID;
    this.searchDistrictsCtrl.setValue('');
    this.districtId = 0;
    this.searchWardsCtrl.setValue('');
  }
  changeDistrict(districtID) {
    this.districtId = districtID;
    this.searchWardsCtrl.setValue('');
  }
  changeWard(wardID) {
    this.filter.WardId = wardID;
    this.reload();
  }


  filtersEventsBinding() {

    this.searchProvincesCtrl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(500),
        tap(() => {
          this.listprovince = [];
          this.isLoading = true;
        }),
        switchMap(value => this.provinceService.getProvincesList({ 'searchTerm': this.utilsService.objectToString(value), 'pageIndex': 1, 'pageSize': 20, 'sortName': 'id', 'sortDirection': 'ASC' })
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
          this.listprovince = [{ notfound: 'Not Found' }];
        } else {
          this.listprovince = data.length ? data : [{ notfound: 'Not Found' }];
        }

      });
    this.searchDistrictsCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(500),
      tap(() => {
        this.listdistrict = [];
        this.isLoading = true;
      }),
      switchMap(value => this.districtService.getDistrictsList({ 'SearchTerm': this.utilsService.objectToString(value), 'ProvinceId': this.provinceId, 'pageIndex': 1, 'pageSize': 20, 'sortName': 'id', 'sortDirection': 'ASC' })
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
          this.listdistrict = [{ notfound: 'Not Found' }];
        } else {
          this.listdistrict = data.length ? data : [{ notfound: 'Not Found' }];
        }

      });
    this.searchWardsCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(500),
      tap(() => {
        this.listward = [];
        this.isLoading = true;
      }),
      switchMap(value => this.wardService.getWardsList({ SearchTerm: this.utilsService.objectToString(value), DistrictId: this.districtId, PageIndex: 1, PageSize: 20 })
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
          this.listward = [{ notfound: 'Not Found' }];
        } else {
          this.listward = data.length ? data : [{ notfound: 'Not Found' }];
        }

      });
  }
}
