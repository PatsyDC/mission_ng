import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
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

  getPresentacionesPorFecha(fecha: string): Observable<any[]> {
    const params = new HttpParams().set('fecha', fecha);

    return this.http.get<any[]>(`${this.url}publicaciones/`, { params })
      .pipe(
        tap(response => console.log('Respuesta del servidor:', response)),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error detallado:', error);
    let errorMessage = 'Ocurrió un error en la solicitud.';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.error?.detail || error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }


  postPresentacion(formData: FormData):Observable<Plantilla>{
    return this.http.post<Plantilla>(`${this.url}publicaciones/`, formData);
  }

  putPresentacion(id: number, formData: FormData): Observable<Plantilla> {
    return this.http.put<Plantilla>(`${this.url}publicaciones/${id}`, formData);
  }

  getListarUser(id: number): Observable<User>{
    return this.http.get<User>(`${this.url}user/${id}`);
  }

}
