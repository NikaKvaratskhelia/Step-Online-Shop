import { Component } from '@angular/core';
import { ShortenTitlePipe } from "../../shorten-title.pipe";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-compare',
  imports: [ShortenTitlePipe, RouterModule],
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.scss',
})
export class CompareComponent {
  public comparing: any[] = [];

  constructor() {
    this.comparing = JSON.parse(sessionStorage.getItem('comparingProducts') || '[]');
  }

  remove(product: any) {
    this.comparing = this.comparing.filter(p => p !== product);
    sessionStorage.setItem('comparingProducts', JSON.stringify(this.comparing))
  }
}
