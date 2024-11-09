import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = 'http://127.0.0.1:8000/api/token/';
  private tokenKey = 'authToken' //valor

  constructor(private http: HttpClient,
    private router: Router
  ) { }

  login(username: string, password: string): Observable<any>{
    return this.http.post<any>(this.url, {username, password}).pipe(
      tap(response =>{
        if(response.access){
          console.log(response.message);  //token
          this.setToken(response.access)
        }
      }) //ejecutar la informacion
    )
  }

  //guardar el token en localStorage
  private setToken(token:string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  //obtener el token de localStorage
  getToken():string | null{
    return localStorage.getItem(this.tokenKey);
  }

  //validar el tiempo de expiración del token y si existe

  isAuthenticated():boolean{
    const token = this.getToken();
    if(!token){
      return false;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() < exp
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  getCurrentUserId(): number | null {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);  // Agrega esta línea
      return payload.user_id || payload.id;  // Intenta ambos campos
    }
    return null;
  }
}