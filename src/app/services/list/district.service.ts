import { Injectable } from '@angular/core';
import { District } from '../../models/list/districts';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DistrictService {
    httpOptions = {  
          headers: new HttpHeaders({  
            'Content-Type': 'application/json; charset=utf-8'  
          })  
    }; 

    constructor(private http: HttpClient) {
    }

    getDistrictsList(filter: any): Observable<any> {
        let queryString =  Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
        return this.http.get(environment.serverUrl_employee + 'Districts?' + queryString , this.httpOptions);
    }
    
    getDistrict(id: any): Observable<any> {
        return this.http.get(environment.serverUrl_employee + `Districts/${id}` , this.httpOptions);
    }

    addOrUpdateDistrict(district: District, by: null | number): Observable<any> {
        district.DisplayOrder = parseInt(district.DisplayOrder + '');
        if (district.Id != 0 && district.Id) {
            district.UpdatedBy = by;
        } else {
            district.CreatedBy = by;
        }
        return this.http.post(environment.serverUrl_employee + `Districts/save`, district, this.httpOptions);
    }

    deleteDistrict(id: number, deletedBy: number): Observable<any> {
        return this.http.delete(environment.serverUrl_employee + `Districts/${id}?deletedBy=${deletedBy}` , this.httpOptions);
    }
}