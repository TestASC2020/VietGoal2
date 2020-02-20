import { SORD_DIRECTION } from "../sort";

export class YardFilter {
    PageIndex: number = 0;
    PageSize: number = 0;
    SearchTerm: string = '';
    AreaID: null | number = null;
    SortName: string = 'ID';
    SortDirection: string = SORD_DIRECTION.DEFAULT;

    constructor(searchTerm: string, pageIndex: number, pageSize: number, AreaID: null | number , sN: string = 'ID', sD: string = SORD_DIRECTION.DEFAULT) {
        this.SearchTerm = searchTerm;
        this.PageIndex = pageIndex;
        this.PageSize = pageSize;
        this.AreaID = AreaID;
        this.SortName = sN;
        this.SortDirection = sD;
    }
}