import { SORD_DIRECTION } from "../sort";

export class RecruitStudentFilter {
    PageIndex: number = 0;
    PageSize: number = 0;
    SearchTerm: string = '';
    recruitDate: string;
    trainingGroundId: null | number ;
    studentId: number | null;
    recruitId: number | null;
    areaId: null | number ;
    yardId: null | number ;
    classId: null | number ;
    approverId: null | number ;
    SortName: string = 'id';
    SortDirection: string = SORD_DIRECTION.ASC;

    constructor(searchTerm: string, pageIndex: number, pageSize: number, 
        trainingGroundId: null | number, studentId: number | null ,recruitId: number | null ,areaId: null | number,yardId: null | number ,classId: null | number, recruitDate: string, sN: string = 'id', sD: string = SORD_DIRECTION.ASC,
        approverId: null | number
        ) {
        this.SearchTerm = searchTerm;
        this.PageIndex = pageIndex;
        this.PageSize = pageSize;
        this.trainingGroundId = trainingGroundId;
        this.studentId = studentId;
        this.areaId = areaId;
        this.yardId = yardId;
        this.classId = classId;
        this.recruitId = recruitId;
        this.recruitDate = recruitDate;
        this.approverId = approverId;
        this.SortName = sN;
        this.SortDirection = sD;
    }
}
