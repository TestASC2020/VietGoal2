import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trungtam } from '../../models/quanly/trungtam';
import { environment } from 'environments/environment';
import { Filter } from 'app/models/filter/filter';
@Injectable({
  providedIn: 'root'
})
export class TrungtamService {
    httpOptions = { 
          headers: new HttpHeaders({  
            'Content-Type': 'application/json; charset=utf-8'  
          })  
    }; 

    trungtamlist: Trungtam[] ;

    constructor(private http: HttpClient) {
    }

    getTrungtamsList(filter: any): Observable<any>  {
        let queryString =  Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
        return this.http.get(environment.serverUrl + 'Centrals?' + queryString , this.httpOptions);
    }
    
    getTrungtam(id: any): Observable<any>  {
        return this.http.get(environment.serverUrl + `Centrals/${id}` , this.httpOptions);
    }

    addOrUpdateTrungtam(trungtam: Trungtam, by: null | number): Observable<any> {
        var obj = {
            ID: trungtam.Id,
            CentralCode: trungtam.MaTrungTam,
            CentralName: trungtam.TenTrungTam,
            Address: trungtam.DiaChi,
            CampusArea: trungtam.DTKhuonVien,
            ProvinceID: trungtam.TinhThanh,
            DistrictID: trungtam.QuanHuyen,
            WardID: trungtam.PhuongXa,
            PhoneNumber: trungtam.DienThoai,
            DateEstablished: trungtam.NgayThanhLap,
            Discription: trungtam.GhiChu,
            Showed: trungtam.isHienThi,
            CreatedBy: null,
            UpdatedBy: null
        };
        if(trungtam.Id == 0) {
            obj.CreatedBy = by;
        } else {
            obj.UpdatedBy = by;
        }
        return this.http.post(environment.serverUrl + `Centrals`, obj, this.httpOptions);
    }

    deleteTrungtam(trungtamId: number, deletedBy: number): Observable<any> {
        return this.http.delete(environment.serverUrl + `Centrals/${trungtamId}?deletedBy=${deletedBy}` , this.httpOptions);
    }
}