import { Component } from '@angular/core';
import { Plantilla } from '../../core/models/modelo.model';
import { PlantillasService } from '../../core/services/plantillas.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import PptxGenJS from 'pptxgenjs';


@Component({
  selector: 'app-detalle-presentacion',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './detalle-presentacion.component.html',
  styleUrl: './detalle-presentacion.component.css'
})
export class DetallePresentacionComponent {


  plantilla?: Plantilla

  constructor(
    private route: ActivatedRoute,
    private service : PlantillasService
  ){}

  ngOnInit(): void{
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const idNumber = parseInt(id, 10);
      this.service.getPresentaciones().subscribe((productosConCategorias: Plantilla[]) => {
        const producto = productosConCategorias.find(p => p.id === idNumber);
        if (producto) {
          this.plantilla = producto;
          console.log(this.plantilla);
        } else {
          console.error('Producto no encontrado');
        }
      });
    } else {
      console.error('ID inválido');
    }
  }

  async generatePPTX() {
    if (!this.plantilla) return;

    try {
      // Crear nueva presentación con new PptxGenJS()
      const pres = new PptxGenJS();  // Cambio importante

      // Crear una nueva diapositiva
      const slide = pres.addSlide();

      // Agregar título
      slide.addText(this.plantilla.title, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        fontSize: 24,
        bold: true,
        align: 'center'
      });

      // Agregar fecha
      slide.addText(`Fecha: ${this.plantilla.fecha}`, {
        x: 0.5,
        y: 1.0,
        fontSize: 14,
        color: '666666'
      });

      // Agregar descripción
      slide.addText(this.plantilla.description || '', {
        x: 0.5,
        y: 1.5,
        w: '90%',
        fontSize: 14,
        align: 'left',
        breakLine: true
      });

      // Agregar imágenes
      if (this.plantilla.image_before) {
        const imageBefore = await this.fetchImageAsBase64(this.plantilla.image_before);
        slide.addImage({
          data: imageBefore,
          x: 0.5,
          y: 2.5,
          w: 4,
          h: 3
        });
      }

      if (this.plantilla.image_after) {
        const imageAfter = await this.fetchImageAsBase64(this.plantilla.image_after);
        slide.addImage({
          data: imageAfter,
          x: 5.5,
          y: 2.5,
          w: 4,
          h: 3
        });
      }

      // Guardar el archivo usando el método writeFile
      await pres.writeFile({ fileName: `presentacion_${this.plantilla.title}.pptx` });

      console.log('Presentación generada exitosamente');

    } catch (error) {
      console.error('Error al generar PPTX:', error);
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
}
