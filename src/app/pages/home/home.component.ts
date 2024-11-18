import { Component, inject, OnInit } from '@angular/core';
import { PlantillasService } from '../../core/services/plantillas.service';
import { Plantilla } from '../../core/models/modelo.model';
import { CreatePresentacionComponent } from '../create-presentacion/create-presentacion.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatDialogModule, RouterLink, FormsModule, CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private dialog = inject(MatDialog);

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
    const fechaSeleccionada = new Date(fecha);
    const fechaActual = new Date();

    // Calcula la diferencia en días
    const diferenciaTiempo = fechaActual.getTime() - fechaSeleccionada.getTime();
    const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));

    // Verifica si la diferencia es mayor a 3 días
    if (diferenciaDias > 3) {
      alert('No puedes acceder al formulario para fechas que tienen más de 3 días de antigüedad.');
      return;
    }

    const dialog = this.dialog.open(CreatePresentacionComponent);

    dialog.afterClosed().subscribe((result) => {
      if (result === true) {
        console.log('OK');
      }
    });
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }
}
