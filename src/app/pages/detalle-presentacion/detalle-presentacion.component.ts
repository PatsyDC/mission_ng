import { Component } from '@angular/core';
import { Plantilla } from '../../core/models/modelo.model';
import { PlantillasService } from '../../core/services/plantillas.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

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
}
