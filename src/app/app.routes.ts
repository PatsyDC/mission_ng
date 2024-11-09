import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/authetication/login/login.component';
import { DetallePresentacionComponent } from './pages/detalle-presentacion/detalle-presentacion.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'presentacion/:id', component: DetallePresentacionComponent}
];
