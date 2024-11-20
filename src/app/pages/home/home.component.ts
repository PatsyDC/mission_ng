import { Component, inject, OnInit } from '@angular/core';
import { PlantillasService } from '../../core/services/plantillas.service';
import { Plantilla } from '../../core/models/modelo.model';
import { CreatePresentacionComponent } from '../create-presentacion/create-presentacion.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EditarPresentacionComponent } from '../editar-presentacion/editar-presentacion.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatDialogModule, RouterLink, FormsModule, CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private dialog = inject(MatDialog);
  private router = inject(Router);

  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo',
    'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre',
    'Noviembre', 'Diciembre',
  ];
  diasDelMes: string[] = [];
  mesSeleccionado: string | null = null;
  mostrarFormulario = false;

  generarFechasDelMes(indiceMes: number): void {
    const anioActual = new Date().getFullYear();
    const primerDia = new Date(anioActual, indiceMes, 1);
    const ultimoDia = new Date(anioActual, indiceMes + 1, 0);

    this.diasDelMes = [];
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(anioActual, indiceMes, dia);
      this.diasDelMes.push(fecha.toISOString().split('T')[0]);
    }

    this.mesSeleccionado = this.meses[indiceMes];
  }

  abrirFormulario(fecha: string): void {
    if (this.fechaPasada(fecha)) {
      console.log('No se puede abrir el formulario para fechas pasadas.');
      return; // Salir si la fecha está bloqueada
    }

    const dialog = this.dialog.open(CreatePresentacionComponent, {
      data: { fechaSeleccionada: fecha }, // Pasa la fecha seleccionada al formulario
    });

    dialog.afterClosed().subscribe((result) => {
      if (result === true) {
        console.log('Formulario completado con éxito.');
      }
    });
  }



  fechaPasada(dia: string): boolean {
    const fechaSeleccionada = new Date(dia);
    const fechaActual = new Date();

    const diferenciaTiempo = fechaActual.getTime() - fechaSeleccionada.getTime();
    const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));

    return diferenciaDias > 3; // Más de 3 días
  }

  verDetalles(fecha: string): void {
    console.log('Fecha seleccionada:', fecha); // Para debugging
    this.router.navigate(['/presentaciones'], {
      queryParams: { fecha: fecha }
    });
  }


  abrirFormEditar(event: Event, fecha: string): void {
    event.stopPropagation(); // Evita que el click en el lápiz dispare el evento del día

    const dialog = this.dialog.open(EditarPresentacionComponent);

    dialog.afterClosed().subscribe(result => {
      if (result === true) {
        console.log('Edición completada');
      }
    });
}


}
