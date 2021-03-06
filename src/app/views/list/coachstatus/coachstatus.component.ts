import { Component, OnInit } from '@angular/core';
import { Filter } from '../../../models/filter/filter';
import { UtilsService } from '../../../services/utils.service';
import { Router } from '@angular/router';
import { ConfirmComponent } from '../../../shared/modal/confirm/confirm.component';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { CoachStatus } from 'app/models/list/coachstatus';
import { CoachStatusService } from 'app/services/list/coachstatus.service';
import { CoachStatusEditComponent } from './coachstatus-edit/coachstatus-edit.component';
import { CoachStatusImportComponent } from './coachstatus-import/coachstatus-import.component';
import { ASCSort, SORD_DIRECTION } from 'app/models/sort';

@Component({
  selector: 'app-coachstatus',
  templateUrl: './coachstatus.component.html',
  styleUrls: ['./coachstatus.component.scss']
})
export class CoachStatusComponent implements OnInit {

  CoachStatusList: CoachStatus[] = [];
  CoachStatus: CoachStatus;
  searchTerm: string = '';
  pageIndex: number = 1;
  pageSizesList: number[] = [5, 10, 20, 100];
  pageSize: number = this.pageSizesList[1];
  currentUser: any;
  loading: boolean;
  Total: any;
  firstRowOnPage: any;
  paginationSettings: any = {
    sort: new ASCSort(),
    sortToggles: [
      null,
      SORD_DIRECTION.ASC, SORD_DIRECTION.ASC,
      null
    ],
    columnsName: ['Order', 'CoachStatusName', 'CoachStatusCode', 'Action'],
    columnsNameMapping: ['', 'coachStatusName', 'coachStatusCode', ''],
    sortAbles: [false, true, true, false],
    visibles: [true, true, true, true]
  }
  constructor(public utilsService: UtilsService, config: NgbModalConfig, private service: CoachStatusService, private router: Router, private modalService: NgbModal) {
    config.backdrop = 'static';
    config.keyboard = false;
    config.scrollable = false;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    utilsService.loadPaginatorLabels();
  }

  ngOnInit() {
    this.reload();
  }

  pageEvent(pageE: any) {
    this.pageIndex = pageE.pageIndex + 1;
    this.pageSize = pageE.pageSize;
    this.reload();
  }
  search(){
    this.reload();
    this.searchTerm = '';
  }
  reload() {
    const filter = {
      searchTerm: this.searchTerm,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      sortName: this.paginationSettings.sort.SortName,
      sortDirection: this.paginationSettings.sort.SortDirection
    };
    this.loading = true;
    this.CoachStatusList = [];
    this.service.getCoachStatusList(filter).subscribe((response: any) => {
      const list = response.results ? response.results : [];
      this.Total = (response && response.rowCount) ? response.rowCount : 0;
      this.firstRowOnPage = (response && response.firstRowOnPage) ? response.firstRowOnPage : 0;
      setTimeout(() => {
        this.loading = false;
        this.CoachStatusList = list || [];
      }, 500);
    });
  }
  add() {
    this.edit(null);
  }

  remove(id: any) {
    const _this = this;
    const modalRef = this.modalService.open(ConfirmComponent, { windowClass: 'modal-confirm' });
    modalRef.componentInstance.confirmObject = 'CoachStatus';
    modalRef.componentInstance.decide.subscribe(() => {
      _this.service.deleteCoachStatus(id).subscribe(() => {
        _this.reload();
      });
    });
  }
  edit(CoachStatusid: null | number) {
    const _this = this;
    const modalRef = this.modalService.open(CoachStatusEditComponent, { size: 'lg' });
    modalRef.componentInstance.popup = true;
    modalRef.componentInstance.CoachStatusId = CoachStatusid;
    modalRef.result.then(function (result) {
      _this.reload();
    });
  }
  
  openImport() {
    const _this = this;
    const modalRef = this.modalService.open(CoachStatusImportComponent, { size: 'lg' });
    modalRef.result.then(function(importModel: any){
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
}
