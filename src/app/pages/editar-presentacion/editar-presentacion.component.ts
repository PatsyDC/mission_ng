import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlantillasService } from '../../core/services/plantillas.service';
import { AuthService } from '../../core/services/auth.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { WebcamImage, WebcamInitError, WebcamModule, WebcamUtil } from 'ngx-webcam';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-editar-presentacion',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, WebcamModule],
  templateUrl: './editar-presentacion.component.html',
  styleUrls: ['./editar-presentacion.component.css']
})
export class EditarPresentacionComponent {
  fromP: FormGroup;
  selectedImageBefore: File | null = null;
  selectedImageAfter: File | null = null;
  imagePreviewBefore: string | null = null;
  imagePreviewAfter: string | null = null;

  // Control de la cámara
  showWebcam = false;
  allowCameraSwitch = true;
  multipleWebcamsAvailable = false;
  deviceId: string | undefined;
  trigger: Subject<void> = new Subject<void>();
  webcamImage: WebcamImage | null = null;

  constructor(
    private servicePresentacion: PlantillasService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private dialog: MatDialogRef<EditarPresentacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { plantillaId: number; plantilla: any }
  ) {
    console.log('ID recibido:', data.plantillaId);

    this.fromP = this.formBuilder.group({
      description: [data.plantilla.description, [Validators.required]],
      image_before: [null],
      image_after: [null],
      fecha: [data.plantilla.fecha, [Validators.required]]
    });

    // Inicializar las previsualizaciones con las URLs de las imágenes existentes
    this.imagePreviewBefore = data.plantilla.image_before; // URL de la imagen "Antes"
    this.imagePreviewAfter = data.plantilla.image_after; // URL de la imagen "Después"

    // Verificar disponibilidad de cámaras
    WebcamUtil.getAvailableVideoInputs().then((mediaDevices: MediaDeviceInfo[]) => {
      this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
    });
  }

  // Manejar la selección de archivos y actualizar la vista previa
  onFileSelected(event: any, imageType: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (imageType === 'image_before') {
          this.selectedImageBefore = file;
          this.imagePreviewBefore = reader.result as string; // Actualizar la vista previa
          this.fromP.patchValue({ image_before: file });
        } else if (imageType === 'image_after') {
          this.selectedImageAfter = file;
          this.imagePreviewAfter = reader.result as string; // Actualizar la vista previa
          this.fromP.patchValue({ image_after: file });
        }
      };
      reader.readAsDataURL(file); // Leer archivo como URL de datos
    }
  }

  // Activar la cámara y capturar imágenes
  takePhoto(imageType: string): void {
    this.showWebcam = true;
    console.log(`Activando cámara para: ${imageType}`);
  }

  // Manejar la imagen capturada
  handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    const capturedImage = webcamImage.imageAsDataUrl;

    if (this.showWebcam) {
      if (this.fromP.get('image_before')?.value === null) {
        this.imagePreviewBefore = capturedImage;
        this.fromP.patchValue({ image_before: capturedImage });
      } else if (this.fromP.get('image_after')?.value === null) {
        this.imagePreviewAfter = capturedImage;
        this.fromP.patchValue({ image_after: capturedImage });
      }
    }
    this.showWebcam = false;
  }

  // Manejar errores al inicializar la cámara
  handleInitError(error: WebcamInitError): void {
    console.error('Error inicializando la cámara:', error);
  }

  // Trigger para capturar imágenes
  triggerSnapshot(): void {
    this.trigger.next();
  }

  // Observable del trigger
  get triggerObservable(): Subject<void> {
    return this.trigger;
  }

  // Validar formulario
  isFormValid(): boolean {
    return this.fromP.valid && this.imagePreviewBefore !== null && this.imagePreviewAfter !== null;
  }

  // Guardar cambios
  save() {
    if (this.fromP.valid) {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        const formData = new FormData();
        formData.append('user', userId.toString());
        formData.append('description', this.fromP.get('description')?.value);

        // Adjuntar nuevas imágenes si han sido seleccionadas
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
            console.log('Publicación actualizada correctamente:', res);
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
