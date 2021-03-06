import { Injectable } from '@angular/core';
import { District } from '../../models/list/districts';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ImportViewModel } from '../../models/importviewmodel';

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
        return this.http.get(environment.serverUrl + 'Districts?' + queryString , this.httpOptions);
    }
    
    getDistrict(id: any): Observable<any> {
        return this.http.get(environment.serverUrl + `Districts/${id}` , this.httpOptions);
    }

    addOrUpdateDistrict(District: District): Observable<any> {
        if (District.id == 0) {
            return this.http.post(environment.serverUrl + 'Districts', District, this.httpOptions);
        } else {
            return this.http.put(environment.serverUrl + `Districts/${District.id}`, District, this.httpOptions);
        }
    }

    deleteDistrict(id: number): Observable<any> {
        return this.http.delete(environment.serverUrl + `Districts/${id}` , this.httpOptions);
    }
    getTemplate(fileName: string) {
        return `${environment.serverOriginUrl}Docs/Templates/${fileName}`;
    }

    import(importViewModel: ImportViewModel): Observable<any> {
        return this.http.post(environment.serverUrl_employee + `districts/import`, importViewModel , this.httpOptions);
    }
}