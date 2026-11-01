import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Icon } from './shared/icon';

@Component({
  imports: [RouterOutlet, Icon],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
