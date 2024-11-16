import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/authetication/login/login.component';
import { DetallePresentacionComponent } from './pages/detalle-presentacion/detalle-presentacion.component';
import { RegisterComponent } from './pages/authetication/register/register.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'presentacion/:id', component: DetallePresentacionComponent}
];
