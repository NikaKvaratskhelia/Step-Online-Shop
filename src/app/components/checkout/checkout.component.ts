import { Component, ViewChild } from '@angular/core';
import { ToolsService } from '../../tools.service';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { HttpHeaders } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-checkout',
  imports: [PopUpComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  @ViewChild(PopUpComponent) popUp!: PopUpComponent;
  constructor(private http: ToolsService) {}

  public headers = new HttpHeaders({
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  });

  formatCardNum(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value
      .replace(/\D/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim();
    this.paymentInfo
      .get('cardNum')
      ?.setValue(input.value, { emitEvent: false });
  }
  formatDate(event: Event) {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, ''); // digits only
    if (v.length > 2) v = v.slice(0, 2) + ' / ' + v.slice(2, 6);
    input.value = v;
    this.paymentInfo
      .get('cardDate')
      ?.setValue(input.value, { emitEvent: false });
  }
  lettersOnly(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^A-Za-z .']/g, '');
    this.paymentInfo
      .get('cardOwner')
      ?.setValue(input.value, { emitEvent: false });
  }
  digitsOnly(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    this.paymentInfo
      .get('cardCvv')
      ?.setValue(input.value, { emitEvent: false });
  }

  checkout(e: Event) {
    e.preventDefault();

    if (this.paymentInfo.invalid) {
      this.paymentInfo.markAllAsTouched();
      this.popUp.show('გთხოვთ შეავსოთ ველები სწორად', 'red');
      return;
    }

    this.http.checkout(this.headers).subscribe((response: any) => {
      console.log('Checkout response:', response);
      this.popUp.show('Checkout successful!', 'green');
      window.location.href = '/';
    });
  }

  public paymentInfo: FormGroup = new FormGroup({
    cardNum: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?:\d{4} ?){3}\d{4}$/),
    ]),
    cardDate: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(0[1-9]|1[0-2]) ?\/ ?\d{4}$/),
    ]),
    cardCvv: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{3,4}$/),
    ]),
    cardOwner: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[A-Za-z .']{2,}$/),
    ]),
  });
}
