import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlantillasService } from '../../core/services/plantillas.service';
import { AuthService } from '../../core/services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-create-presentacion',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-presentacion.component.html',
  styleUrl: './create-presentacion.component.css'
})
export class CreatePresentacionComponent {

  fromP : FormGroup;
  selectedImageBefore: File | null = null;
  selectedImageAfter: File | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { fechaSeleccionada?: string },
    private servicePresentacion: PlantillasService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private dialog: MatDialogRef<CreatePresentacionComponent>
  ) {
    const fechaActual = data?.fechaSeleccionada || new Date().toISOString().split('T')[0]; // Fecha seleccionada o actual
    this.fromP = this.formBuilder.group({
      description: ['', [Validators.required]],
      image_before: [null],
      image_after: [null],
      fecha: [fechaActual, [Validators.required]], // Fecha predeterminada
    });
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
        formData.append('title', this.fromP.get('title')?.value);
        formData.append('description', this.fromP.get('description')?.value);
        formData.append('image_before', this.selectedImageBefore, this.selectedImageBefore.name);
        formData.append('image_after', this.selectedImageAfter, this.selectedImageAfter.name);

        // Format date to YYYY-MM-DD
        const fechaValue = this.fromP.get('fecha')?.value;
        const formattedDate = new Date(fechaValue).toISOString().split('T')[0];
        formData.append('fecha', formattedDate);

        this.servicePresentacion.postPresentacion(formData).subscribe({
          next: (res) => {
            console.log("Publicación creada correctamente:", res);
            this.fromP.reset();
            this.selectedImageBefore = null;
            this.selectedImageAfter = null;
            this.dialog.close(true);
          },
          error: (error) => {
            console.error('Error creating presentation:', error);
            // You might want to show an error message to the user here
          }
        });
      } else {
        console.error("No se pudo obtener el ID del usuario");
      }
    }
  }

  takePhoto(imageType: string) {
  const videoElement = document.getElementById('video') as HTMLVideoElement;
  const modal = document.getElementById('cameraModal') as HTMLElement;
  const closeCamera = document.getElementById('closeCamera') as HTMLButtonElement;
  const captureButton = document.getElementById('capture') as HTMLButtonElement;

  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      videoElement.srcObject = stream;
      videoElement.play();
      modal.classList.remove('hidden'); // Mostrar el modal

      // Cerrar la cámara
      closeCamera.onclick = () => {
        stream.getTracks().forEach((track) => track.stop());
        modal.classList.add('hidden'); // Ocultar el modal
      };

      // Capturar la imagen
      captureButton.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');

        // Convertir la imagen en Blob y asignarla al archivo correspondiente
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const fileName = `captured_image_${imageType}.png`;
            if (imageType === 'image_before') {
              this.selectedImageBefore = new File([blob], fileName, { type: 'image/png' });
            } else if (imageType === 'image_after') {
              this.selectedImageAfter = new File([blob], fileName, { type: 'image/png' });
            }
            console.log(`${imageType} capturada y asignada`);
          });

        // Detener el flujo de video y ocultar el modal
        stream.getTracks().forEach((track) => track.stop());
        modal.classList.add('hidden');
      };
    })
    .catch((error) => {
      console.error('Error accediendo a la cámara:', error);
      alert('No se pudo acceder a la cámara. Por favor, revisa los permisos.');
    });
}



}
