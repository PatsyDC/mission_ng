import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlantillasService } from '../../core/services/plantillas.service';
import { AuthService } from '../../core/services/auth.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-editar-presentacion',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './editar-presentacion.component.html',
  styleUrl: './editar-presentacion.component.css'
})
export class EditarPresentacionComponent {

  fromP: FormGroup;
  selectedImageBefore: File | null = null;
  selectedImageAfter: File | null = null;

  constructor(
    private servicePresentacion: PlantillasService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private dialog: MatDialogRef<EditarPresentacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { plantillaId: number, plantilla: any } // Datos inyectados con la plantilla a editar
  ) {
    this.fromP = this.formBuilder.group({
      description: [data.plantilla.description, [Validators.required]],
      image_before: [null],
      image_after: [null]

    });

    // Si ya tienes imágenes guardadas, puedes asignarlas aquí
    this.selectedImageBefore = data.plantilla.image_before;
    this.selectedImageAfter = data.plantilla.image_after;
  }

  onFileSelected(event: any, imageType: string) {
    const fileInput = event.target;
    if (fileInput.id === 'image_before') {
      this.selectedImageBefore = fileInput.files[0] as File;
    } else if (fileInput.id === 'image_after') {
      this.selectedImageAfter = fileInput.files[0] as File;
    }
  }

  isFormValid(): boolean {
    return this.fromP.valid && this.selectedImageBefore !== null && this.selectedImageAfter !== null;
  }

  save() {
    if (this.fromP.valid && this.selectedImageBefore && this.selectedImageAfter) {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        const formData = new FormData();
        formData.append('user', userId.toString());
        formData.append('description', this.fromP.get('description')?.value);
        if (this.selectedImageBefore) {
          formData.append('image_before', this.selectedImageBefore, this.selectedImageBefore.name);
        }
        if (this.selectedImageAfter) {
          formData.append('image_after', this.selectedImageAfter, this.selectedImageAfter.name);
        }

        // Llamar al servicio de PUT para actualizar la presentación
        this.servicePresentacion.putPresentacion(this.data.plantillaId, formData).subscribe({
          next: (res) => {
            console.log("Publicación actualizada correctamente:", res);
            this.dialog.close(true); // Cerrar el diálogo y pasar un valor de éxito
          },
          error: (error) => {
            console.error('Error updating presentation:', error);
          }
        });
      } else {
        console.error("No se pudo obtener el ID del usuario");
      }
    }
  }

}
