import { Component, OnInit } from '@angular/core';
import { Filter } from '../../../models/filter/filter';
import { UtilsService } from '../../../services/utils.service';
import { Router } from '@angular/router';
import { ConfirmComponent } from '../../../shared/modal/confirm/confirm.component';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { StudentStatus } from 'app/models/list/studentstatus';
import { StudentStatusService } from 'app/services/list/studentstatus.service';
import { StudentStatusEditComponent } from './studentstatus-edit/studentstatus-edit.component';
import { StudentStatusImportComponent } from './studentstatus-import/studentstatus-import.component';
import { SORD_DIRECTION, ASCSort } from 'app/models/sort';


@Component({
  selector: 'app-studentstatus',
  templateUrl: './studentstatus.component.html',
  styleUrls: ['./studentstatus.component.scss']
})
export class StudentStatusComponent implements OnInit {

  StudentStatusList: StudentStatus[] = [];
  StudentStatus: StudentStatus;
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
      null, null
    ],
    columnsName: ['Order', 'StudentStatusName', 'StudentStatusCode', 'Color', 'Action'],
    columnsNameMapping: ['', 'studentStatusName', 'studentStatusCode', '', ''],
    sortAbles: [false, true, true, false, false],
    visibles: [true, true, true, true, true]
  }
  constructor(public utilsService: UtilsService, config: NgbModalConfig, private service: StudentStatusService, private router: Router, private modalService: NgbModal) {
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
  public reload() {
    const filter = {
      searchTerm: this.searchTerm,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      sortName: this.paginationSettings.sort.SortName,
      sortDirection: this.paginationSettings.sort.SortDirection
    };
    this.loading = true;
    this.StudentStatusList = [];
    this.service.getStudentStatusList(filter).subscribe((response: any) => {
      const list = response.results ? response.results : [];
      this.Total = (response && response.rowCount) ? response.rowCount : 0;
      this.firstRowOnPage = (response && response.firstRowOnPage) ? response.firstRowOnPage : 0;
      setTimeout(() => {
        this.loading = false;
        this.StudentStatusList = list || [];
      }, 500);
    });
  }
  add() {
    this.edit(null);
  }

  remove(id: any) {
    const _this = this;
    const modalRef = this.modalService.open(ConfirmComponent, { windowClass: 'modal-confirm' });
    modalRef.componentInstance.confirmObject = 'StudentStatus';
    modalRef.componentInstance.decide.subscribe(() => {
      _this.service.deleteStudentStatus(id).subscribe(() => {
        _this.reload();
      });
    });
  }
  edit(StudentStatusid: null | number) {
    const _this = this;
    const modalRef = this.modalService.open(StudentStatusEditComponent, { size: 'lg' });
    modalRef.componentInstance.popup = true;
    modalRef.componentInstance.StudentStatusId = StudentStatusid;
    modalRef.result.then(function (result) {
      _this.reload();
    });
  }

  openImport() {
  const _this = this;
  const modalRef = this.modalService.open(StudentStatusImportComponent, { size: 'lg' });
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
