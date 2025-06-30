import { Component, ViewChild } from '@angular/core';
import { ToolsService } from '../../tools.service';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-checkout',
  imports: [PopUpComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  @ViewChild(PopUpComponent) popUp!: PopUpComponent;  
  constructor(private http: ToolsService) {}

  public headers = new HttpHeaders({
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  });

   checkout(e:Event) {
    e.preventDefault();
    this.http.checkout(this.headers).subscribe((response: any) => {
      console.log('Checkout response:', response);
      this.popUp.show('Checkout successful!', 'green');
    });
  }
}
