import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ShortenTitlePipe } from '../../Pipes/shorten-title.pipe';

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
