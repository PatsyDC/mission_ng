import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlantillasService } from '../../core/services/plantillas.service';
import { AuthService } from '../../core/services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';

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
    private servicePresentacion: PlantillasService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private dialog: MatDialogRef<CreatePresentacionComponent>
  ) {
    this.fromP = this.formBuilder.group({
      description : ['', [Validators.required]],
      image_before : [null],
      image_after: [null]
      //fecha : ['', [Validators.required]],
    })
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
    const videoElement = document.createElement('video');
    const canvasElement = document.createElement('canvas');
    const context = canvasElement.getContext('2d');

    if (!context) return;

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoElement.srcObject = stream;
        videoElement.play();

        // Abrir un modal o popup con la vista de la cámara
        const modal = document.createElement('div');
        modal.classList.add('camera-modal');
        modal.innerHTML = `
          <div class="camera-container">
            <video id="video" autoplay></video>
            <button id="capture" class="capture-button">Capturar Foto</button>
          </div>
        `;
        document.body.appendChild(modal);

        const captureButton = document.getElementById('capture');
        captureButton?.addEventListener('click', () => {
          context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
          const dataUrl = canvasElement.toDataURL('image/png');

          // Convert the data URL to a Blob and set it as the image file
          fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
              if (imageType === 'image_before') {
                this.selectedImageBefore = new File([blob], 'captured_image_before.png', { type: 'image/png' });
              } else if (imageType === 'image_after') {
                this.selectedImageAfter = new File([blob], 'captured_image_after.png', { type: 'image/png' });
              }
            });

          // Detener el stream y cerrar el modal
          stream.getTracks().forEach(track => track.stop());
          modal.remove();
        });
      })
      .catch((error) => {
        console.error("Error accessing the camera: ", error);
      });
  }


}
