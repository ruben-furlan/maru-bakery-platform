import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CartComponent } from './cart.component';
import { FooterComponent } from './footer.component';
import { HeaderComponent } from './header.component';
import { HeroComponent } from './hero.component';
import { TestimonialsComponent } from './testimonials.component';
import { MarqueeComponent } from './marquee.component';
import { MobileNavComponent } from './mobile-nav.component';
import { ShowcaseComponent } from './showcase.component';
import { StepsComponent } from './steps.component';
import { ScrollProgressComponent } from '../shared/scroll-progress.component';

@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ScrollProgressComponent,
    HeaderComponent,
    HeroComponent,
    MarqueeComponent,
    ShowcaseComponent,
    StepsComponent,
    TestimonialsComponent,
    FooterComponent,
    MobileNavComponent,
    CartComponent,
  ],
  template: `
    <app-scroll-progress />
    <app-header />
    <main>
      <app-hero />
      <app-marquee />
      <app-showcase />
      <app-steps />
      <app-testimonials />
    </main>
    <app-footer />
    <app-mobile-nav />
    <app-cart />
  `,
})
export class LandingPageComponent {}
