import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor( private service : AuthService,
    private router: Router
  ) {}

  login(): void {
    this.errorMessage = '';
    this.service.login(this.username, this.password).subscribe({
      next: () => {
        console.log('Login exitoso');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error de login', err);
        this.errorMessage = 'Usuario o contraseña incorrectos';
      }
    });
  }

}
