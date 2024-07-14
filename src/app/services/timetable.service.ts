import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimetableService {

  constructor(private http: HttpClient) { }

  getTimetable(): Observable<any> {
    return this.http.get('/assets/timetable.json');
  }
}