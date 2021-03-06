export class Recruit{
    id: number;
    RecruitsCode: string;
    RecruitsName:string;
    RecruitsColor: string;
    CreatedDate: null | Date;
    UpdatedDate: null | Date;
    CreatedBy: null | number;
    UpdatedBy: null | number;
    DeletedBy: null | number;
    DeletedDate: null | Date;
	DisplayOrder:number;
    constructor(id: number,  RecruitsCode: string, RecruitsName: string, RecruitsColor: string,DisplayOrder:number, CreatedDate: null | Date, UpdatedDate: null | Date, CreatedBy: null | number,
		UpdatedBy: null | number, DeletedBy: null | number , DeletedDate: null | Date) {
        this.id = id;
        this. RecruitsCode =  RecruitsCode;
        this.RecruitsName = RecruitsName;
        this.RecruitsColor = RecruitsColor;
        this.CreatedDate = CreatedDate;
	    this.UpdatedDate = UpdatedDate;
	    this.CreatedBy = CreatedBy;
	    this.UpdatedBy = UpdatedBy;
        this.DeletedBy = DeletedBy;
        this.DeletedDate = DeletedDate;
        this.DisplayOrder = DisplayOrder;
    }
}