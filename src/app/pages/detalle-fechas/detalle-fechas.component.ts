import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlantillasService } from '../../core/services/plantillas.service';

@Component({
  selector: 'app-detalle-fechas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-fechas.component.html',
  styleUrl: './detalle-fechas.component.css'
})
export class DetalleFechasComponent implements OnInit {

  fecha: string | null = null;
  registros: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private plantillaService: PlantillasService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.fecha = params['fecha'];
      if (this.fecha) {
        console.log('Fecha recibida en el componente:', this.fecha);
        this.cargarRegistrosPorFecha(this.fecha);
      }
    });
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
          }
        },
        error: (error: { message: any; }) => {
          console.error('Error al cargar los registros:', error);
          this.error = 'Error al cargar los registros: ' + (error.message || 'Error desconocido');
          this.loading = false;
        }
      });
  }

}
