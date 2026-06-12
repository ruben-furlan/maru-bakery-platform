import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Marü Bakery — Pastelería artesanal por encargo en Montevideo',
    loadComponent: () =>
      import('./landing/landing-page.component').then((m) => m.LandingPageComponent),
  },
  {
    // El panel se carga de forma diferida: no pesa en la visita a la landing.
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
