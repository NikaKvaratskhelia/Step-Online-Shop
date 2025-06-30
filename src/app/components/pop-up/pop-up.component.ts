import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-pop-up',
  imports: [CommonModule],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.scss',
})
export class PopUpComponent {
  public visible: boolean = false;
  public message: string = '';
  public color: string = '';

  show(message: string, color: 'green' | 'red') {
    this.message = message;
    this.visible = true;
    this.color = color;

    setTimeout(() => {
      this.visible = false;
    }, 3000);
  }
}
