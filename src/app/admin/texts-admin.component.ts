import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextosSitio } from '../core/models';
import { SiteTextsService } from '../core/site-texts.service';

@Component({
  selector: 'app-texts-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <h1 class="text-2xl text-bordo">Textos del sitio</h1>
    <p class="mt-1 text-sm text-cacao/60">
      Editá el eslogan, el marquee y los datos de contacto sin tocar código.
    </p>

    @if (mensaje(); as msg) {
      <p class="mt-4 rounded-xl bg-dorado/20 p-3 text-sm text-cacao" role="status">{{ msg }}</p>
    }

    <form
      class="mt-6 max-w-2xl space-y-5 rounded-vitrina bg-white p-5 shadow-bordo sm:p-6"
      (ngSubmit)="guardar()"
    >
      <label class="block">
        <span class="mb-1 block text-sm font-bold">Eslogan (titular del hero)</span>
        <input
          type="text"
          name="eslogan"
          [(ngModel)]="form.eslogan"
          required
          class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
        />
      </label>

      <label class="block">
        <span class="mb-1 block text-sm font-bold">Subtítulo del hero</span>
        <textarea
          name="hero_subtitulo"
          [(ngModel)]="form.hero_subtitulo"
          rows="2"
          class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
        ></textarea>
      </label>

      <label class="block">
        <span class="mb-1 block text-sm font-bold">Frases del marquee</span>
        <input
          type="text"
          name="marquee"
          [(ngModel)]="form.marquee"
          class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
        />
        <span class="mt-1 block text-xs text-cacao/50">Separá las frases con el carácter "·"</span>
      </label>

      <div class="grid gap-5 sm:grid-cols-2">
        <label class="block">
          <span class="mb-1 block text-sm font-bold">WhatsApp</span>
          <input
            type="text"
            name="whatsapp"
            [(ngModel)]="form.whatsapp"
            class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
          />
          <span class="mt-1 block text-xs text-cacao/50"
            >Formato internacional sin "+", ej: 59899123456</span
          >
        </label>
        <label class="block">
          <span class="mb-1 block text-sm font-bold">Instagram</span>
          <input
            type="text"
            name="instagram"
            [(ngModel)]="form.instagram"
            class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
          />
          <span class="mt-1 block text-xs text-cacao/50"
            >Usuario sin "&#64;", ej: marubakery.uy</span
          >
        </label>
        <label class="block">
          <span class="mb-1 block text-sm font-bold">Email de contacto</span>
          <input
            type="email"
            name="email"
            [(ngModel)]="form.email"
            class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
          />
        </label>
        <label class="block">
          <span class="mb-1 block text-sm font-bold">Dirección / zona</span>
          <input
            type="text"
            name="direccion"
            [(ngModel)]="form.direccion"
            class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
          />
        </label>
      </div>

      <fieldset class="space-y-3 rounded-2xl border border-dorado/40 bg-dorado/5 p-4">
        <legend class="px-2 text-sm font-bold text-bordo">
          Estadísticas de la sección "Lo que dicen nuestros clientes"
        </legend>
        <p class="text-xs text-cacao/60">
          Tres números gancho, ej: "+100" / "pedidos entregados". Dejá uno vacío para ocultarlo.
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-sm font-bold">Estadística 1 — número</span>
            <input
              type="text"
              name="stat_1_numero"
              [(ngModel)]="form.stat_1_numero"
              class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold">Estadística 1 — texto</span>
            <input
              type="text"
              name="stat_1_texto"
              [(ngModel)]="form.stat_1_texto"
              class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold">Estadística 2 — número</span>
            <input
              type="text"
              name="stat_2_numero"
              [(ngModel)]="form.stat_2_numero"
              class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold">Estadística 2 — texto</span>
            <input
              type="text"
              name="stat_2_texto"
              [(ngModel)]="form.stat_2_texto"
              class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold">Estadística 3 — número</span>
            <input
              type="text"
              name="stat_3_numero"
              [(ngModel)]="form.stat_3_numero"
              class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold">Estadística 3 — texto</span>
            <input
              type="text"
              name="stat_3_texto"
              [(ngModel)]="form.stat_3_texto"
              class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
            />
          </label>
        </div>
      </fieldset>

      @if (error()) {
        <p class="rounded-xl bg-bordo/10 p-3 text-sm text-bordo" role="alert">{{ error() }}</p>
      }

      <button
        type="submit"
        [disabled]="guardando()"
        class="w-full rounded-full bg-bordo px-6 py-2.5 font-bold text-crema transition-colors hover:bg-bordo-dark disabled:opacity-60 sm:w-auto"
      >
        {{ guardando() ? 'Guardando…' : 'Guardar textos' }}
      </button>
    </form>
  `,
})
export class TextsAdminComponent {
  private readonly textos = inject(SiteTextsService);

  form: TextosSitio = { ...this.textos.textos() };

  readonly guardando = signal(false);
  readonly mensaje = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  async guardar(): Promise<void> {
    this.error.set(null);
    this.mensaje.set(null);
    this.guardando.set(true);
    const error = await this.textos.guardar(this.form);
    this.guardando.set(false);

    if (error) {
      this.error.set(error);
    } else {
      this.mensaje.set('Textos guardados ✔ Ya se ven en la landing.');
    }
  }
}
