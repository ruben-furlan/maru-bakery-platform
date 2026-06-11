import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Protege /admin: sin sesión activa redirige al login. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const session = await auth.obtenerSesion();
  return session ? true : router.createUrlTree(['/admin/login']);
};
