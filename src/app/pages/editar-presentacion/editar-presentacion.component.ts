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
    @Inject(MAT_DIALOG_DATA) public data: { plantillaId: number, plantilla: any }
  ) {
    console.log('ID recibido:', data.plantillaId);

    this.fromP = this.formBuilder.group({
      description: [data.plantilla.description, [Validators.required]],
      image_before: [null],
      image_after: [null],
      fecha: [data.plantilla.fecha, [Validators.required]],
    });

    // Conservar las imágenes existentes si no se seleccionan nuevas
    this.selectedImageBefore = data.plantilla.image_before;
    this.selectedImageAfter = data.plantilla.image_after;
  }

  // Método para manejar la selección de archivos
  onFileSelected(event: any, imageType: string) {
    const file = event.target.files[0];
    if (file) {
      if (imageType === 'image_before') {
        this.selectedImageBefore = file;
        this.fromP.patchValue({ image_before: file });
      } else if (imageType === 'image_after') {
        this.selectedImageAfter = file;
        this.fromP.patchValue({ image_after: file });
      }
    }
  }

  // Método para validar el formulario
  isFormValid(): boolean {
    return this.fromP.valid && this.selectedImageBefore !== null && this.selectedImageAfter !== null;
  }

  save() {
    if (this.fromP.valid) {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        const formData = new FormData();
        formData.append('user', userId.toString());
        formData.append('description', this.fromP.get('description')?.value);

        // Solo adjuntar nuevas imágenes si se han seleccionado
        if (this.selectedImageBefore instanceof File) {
          formData.append('image_before', this.selectedImageBefore);
        }
        if (this.selectedImageAfter instanceof File) {
          formData.append('image_after', this.selectedImageAfter);
        }

        formData.append('fecha', this.fromP.get('fecha')?.value);

        console.log('Actualizando presentación con ID:', this.data.plantillaId);

        this.servicePresentacion.putPresentacion(this.data.plantillaId, formData).subscribe({
          next: (res) => {
            console.log("Publicación actualizada correctamente:", res);
            this.dialog.close(true);
          },
          error: (error) => {
            console.error('Error updating presentation:', error);
          }
        });
      }
    }
  }

}
