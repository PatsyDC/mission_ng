import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlantillasService } from '../../core/services/plantillas.service';
import { Plantilla } from '../../core/models/modelo.model';
import PptxGenJS from 'pptxgenjs';
import { EditarPresentacionComponent } from '../editar-presentacion/editar-presentacion.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-detalle-fechas',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './detalle-fechas.component.html',
  styleUrl: './detalle-fechas.component.css'
})
export class DetalleFechasComponent implements OnInit {

  fecha: string | null = null;
  registros: any[] = [];
  loading = false;
  error: string | null = null;
  plantilla: any;
  user?: User;

  constructor(
    private route: ActivatedRoute,
    private plantillaService: PlantillasService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { plantilla: any } | null
  ) {
    if (data) {
      this.plantilla = data.plantilla;
    }
  }

  ngOnInit(): void {
    // Si no estamos en modo diálogo, obtener fecha de los parámetros de la ruta
    if (!this.data) {
      this.route.queryParams.subscribe(params => {
        this.fecha = params['fecha'];
        if (this.fecha) {
          console.log('Fecha recibida en el componente:', this.fecha);
          this.cargarRegistrosPorFecha(this.fecha);
        }
        
      });
    }
    // Si estamos en modo diálogo, usar los datos proporcionados
    else {
      // Aquí puedes manejar la inicialización cuando el componente se usa como diálogo
      this.plantilla = this.data.plantilla;
    }
  }

  cargarRegistrosPorFecha(fecha: string): void {
    this.loading = true;
    this.error = null;

    console.log(`Intentando cargar registros para la fecha: ${fecha}`);

    this.plantillaService.getPresentacionesPorFecha(fecha)
      .subscribe({
        next: (response: any[]) => {
          console.log('Respuesta completa del servidor:', response);
          this.registros = response;
          this.loading = false;

          if (this.registros.length === 0) {
            console.log('No se encontraron registros para esta fecha');
            this.error = 'No hay registros disponibles para esta fecha';
          } else {
            console.log(`Se encontraron ${this.registros.length} registros`);

            this.registros.forEach((registro) => {
              if (registro.user) {
                this.loadUserDetails(registro);
              }
            });
          }
        },
        error: (error: { message: any; }) => {
          console.error('Error al cargar los registros:', error);
          this.error = 'Error al cargar los registros: ' + (error.message || 'Error desconocido');
          this.loading = false;
        }
      });
  }

  loadUserDetails(registro: any): void {
    this.plantillaService.getListarUser(registro.user).subscribe(
      (user: User) => {
        // Almacena el nombre completo del usuario en el registro
        registro.usuarioNombre = `${user.username} ${user.last_name}`;
      },
      error => {
        console.error('Error al cargar usuario:', error);
      }
    );
  }

  async generatePPTX() {
    if (this.registros.length === 0) {
      console.error('No hay registros para generar la presentación');
      return;
    }

    try {
      // Crear nueva presentación
      const pres = new PptxGenJS();

      // Crear una diapositiva por cada registro
      for (const registro of this.registros) {
        const slide = pres.addSlide();

        // Agregar título con el nombre del usuario
        slide.addText(registro.usuario, {
          x: 0.5,
          y: 0.5,
          w: '90%',
          fontSize: 24,
          bold: true,
          align: 'center'
        });

        // Agregar fecha
        slide.addText(`Fecha: ${new Date(registro.fecha).toLocaleDateString()}`, {
          x: 0.5,
          y: 1.0,
          fontSize: 14,
          color: '666666'
        });

        // Agregar descripción
        slide.addText(registro.description || '', {
          x: 0.5,
          y: 1.5,
          w: '90%',
          fontSize: 14,
          align: 'left',
          breakLine: true
        });

        // Agregar imágenes si existen
        if (registro.image_before) {
          try {
            const imageBefore = await this.fetchImageAsBase64(registro.image_before);
            slide.addImage({
              data: imageBefore,
              x: 0.5,
              y: 2.5,
              w: 4,
              h: 3
            });
          } catch (error) {
            console.error('Error al cargar imagen before:', error);
          }
        }

        if (registro.image_after) {
          try {
            const imageAfter = await this.fetchImageAsBase64(registro.image_after);
            slide.addImage({
              data: imageAfter,
              x: 5.5,
              y: 2.5,
              w: 4,
              h: 3
            });
          } catch (error) {
            console.error('Error al cargar imagen after:', error);
          }
        }
      }

      // Generar y descargar el archivo
      await pres.writeFile({
        fileName: `presentacion_${this.fecha?.replace(/[\/\\:]/g, '-')}.pptx`
      });

      console.log('Presentación generada exitosamente');

    } catch (error) {
      console.error('Error al generar PPTX:', error);
      this.error = 'Error al generar la presentación: ' + (error as Error).message;
    }
  }

  // Función auxiliar para convertir imágenes a Base64
  private async fetchImageAsBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error al cargar la imagen:', error);
      throw error;
    }
  }

  abrirFormEditar(id: number): void {
    const registro = this.registros.find(r => r.id === id);
    const dialogRef = this.dialog.open(EditarPresentacionComponent, {
      data: {
        plantillaId: id,  // Añadimos explícitamente el ID
        plantilla: registro
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        console.log('Edición completada');
        // Recargar los datos después de la edición
        if (this.fecha) {
          this.cargarRegistrosPorFecha(this.fecha);
        }
      }
    });
  }


}
