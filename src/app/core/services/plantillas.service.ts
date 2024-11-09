import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Plantilla } from '../models/modelo.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PlantillasService {

  private url = 'http://127.0.0.1:8000/api/'

  constructor(
    private http: HttpClient
  ) { }

  getPresentaciones(): Observable<Plantilla[]>{
    return this.http.get<Plantilla[]>(`${this.url}publicaciones/`)
  }

  postPresentacion(formData: FormData):Observable<Plantilla>{
    return this.http.post<Plantilla>(`${this.url}publicaciones/`, formData);
  }

  getListarUser(id: number): Observable<User>{
    return this.http.get<User>(`${this.url}user/${id}`);
  }
  
}
