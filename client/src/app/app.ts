import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { I18nService } from './shared/i18n';
import { Icon } from './shared/icon';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly i18n = inject(I18nService);
}
