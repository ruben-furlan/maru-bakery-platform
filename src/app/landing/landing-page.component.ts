import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FooterComponent } from './footer.component';
import { HeaderComponent } from './header.component';
import { HeroComponent } from './hero.component';
import { InstagramComponent } from './instagram.component';
import { MarqueeComponent } from './marquee.component';
import { MobileNavComponent } from './mobile-nav.component';
import { ShowcaseComponent } from './showcase.component';
import { StepsComponent } from './steps.component';

@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    HeroComponent,
    MarqueeComponent,
    ShowcaseComponent,
    StepsComponent,
    InstagramComponent,
    FooterComponent,
    MobileNavComponent,
  ],
  template: `
    <app-header />
    <main>
      <app-hero />
      <app-marquee />
      <app-showcase />
      <app-steps />
      <app-instagram />
    </main>
    <app-footer />
    <app-mobile-nav />
  `,
})
export class LandingPageComponent {}
