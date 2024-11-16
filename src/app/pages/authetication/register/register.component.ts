import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router) {
    // Inicializa el formulario con validadores
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password2: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required]
    });
  }

  // Método para enviar el formulario
  onSubmit(): void {
    if (this.registerForm.valid) {
      // Verifica si las contraseñas coinciden
      if (this.registerForm.value.password !== this.registerForm.value.password2) {
        this.errorMessage = 'Las contraseñas no coinciden';
        return;
      }

      // Llama al servicio de registro
      this.authService.registerUser(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Usuario registrado exitosamente', response);
          this.router.navigate(['/login']);  // Redirecciona al login después del registro
        },
        error: (error) => {
          console.error('Error en el registro', error);
          this.errorMessage = 'Error al registrar el usuario. Por favor, inténtalo de nuevo.';
        }
      });
    } else {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
    }
  }

}
