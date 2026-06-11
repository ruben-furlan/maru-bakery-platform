import { Routes } from '@angular/router';
import { authGuard } from '../core/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    title: 'Ingresar — Marü Bakery Admin',
    loadComponent: () => import('./login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        title: 'Productos — Marü Bakery Admin',
        loadComponent: () => import('./products-admin.component').then((m) => m.ProductsAdminComponent),
      },
      {
        path: 'destacados',
        title: 'Destacados — Marü Bakery Admin',
        loadComponent: () => import('./featured-admin.component').then((m) => m.FeaturedAdminComponent),
      },
      {
        path: 'textos',
        title: 'Textos — Marü Bakery Admin',
        loadComponent: () => import('./texts-admin.component').then((m) => m.TextsAdminComponent),
      },
      {
        path: 'pedidos',
        title: 'Pedidos — Marü Bakery Admin',
        loadComponent: () => import('./orders-admin.component').then((m) => m.OrdersAdminComponent),
      },
    ],
  },
];
