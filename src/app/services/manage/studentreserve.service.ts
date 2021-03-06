import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentReserve } from '../../models/manage/studentreserve';
import { environment } from 'environments/environment';
import { Filter } from 'app/models/filter/filter';
import { ImportViewModel } from 'app/models/importviewmodel';
@Injectable({
  providedIn: 'root'
})
export class StudentReserveService {
    StudentReservelist: StudentReserve[] ;
    httpOptions = { 
          headers: new HttpHeaders({  
            'Content-Type': 'application/json; charset=utf-8'  
          })  
    }; 


    constructor(private http: HttpClient) {
    }

    getStudentReserveList(filter: any): Observable<any>  {
        let queryString =  Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
        return this.http.get(environment.serverUrl + 'StudentReserve?' + queryString , this.httpOptions);
    }

    getStudentReserve(id: any): Observable<any>  {
        return this.http.get(environment.serverUrl + `StudentReserve/${id}` , this.httpOptions);
        
    }
    addOrUpdateStudentReserve(aStudentReserve: StudentReserve): Observable<any> {
        if (aStudentReserve.id == 0) {
            return this.http.post(environment.serverUrl + 'StudentReserve', aStudentReserve, this.httpOptions);
        } else {
            return this.http.put(environment.serverUrl + `StudentReserve/${aStudentReserve.id}`, aStudentReserve, this.httpOptions);
        }
    }

    deleteStudentReserve(StudentReserveId: number, deletedBy: number): Observable<any> {
        return this.http.delete(environment.serverUrl + `StudentReserve/${StudentReserveId}?deletedBy=${deletedBy}` , this.httpOptions);
    }
    getTemplate(fileName: string) {
        return `${environment.serverOriginUrl}Docs/Templates/${fileName}`;
    }

    import(importViewModel: ImportViewModel): Observable<any> {
        return this.http.post(environment.serverUrl_employee + `StudentReserve/import`, importViewModel , this.httpOptions);
    }
}