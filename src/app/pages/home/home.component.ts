import { Component, inject } from '@angular/core';
import { PlantillasService } from '../../core/services/plantillas.service';
import { Plantilla } from '../../core/models/modelo.model';
import { CreatePresentacionComponent } from '../create-presentacion/create-presentacion.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatDialogModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  private dialog = inject(MatDialog);
  plantilla: Plantilla[] = [];

  constructor(
    private service : PlantillasService
  ){}

  ngOnInit(): void{
    this.loadPresentaciones();
  }

  loadPresentaciones(): void {
    this.service.getPresentaciones().subscribe((data) => {
      console.log(data);
      this.plantilla = data;
    })
  }

  openFormPresentacion(){
    const dialog = this.dialog.open(CreatePresentacionComponent);

    dialog.afterClosed().subscribe(result => {
      if(result === true) {
        this.loadPresentaciones();
      }
    })
  }
}
