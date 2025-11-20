import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { HttpHeaders } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, finalize, Subject, takeUntil, tap } from 'rxjs';
import { ToolsService } from '../../Services/tools.service';

@Component({
  selector: 'app-checkout',
  imports: [PopUpComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnDestroy, OnInit {
  @ViewChild(PopUpComponent) popUp!: PopUpComponent;
  constructor(private http: ToolsService) {}
  ngOnInit(): void {
    this.loadDataAdmin();
  }

  ngOnDestroy(): void {
    this.destroy$.next;
    this.destroy$.complete();
  }

  public daysArr: string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  public destroy$ = new Subject();
  public sales: any;

  public headers = new HttpHeaders({
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  });

  loadDataAdmin() {
    this.http
      .getAdminArrs()
      .pipe(
        takeUntil(this.destroy$),
        tap((data: any) => {
          this.sales = data.sales;
        }),
        catchError((err) => {
          console.log(err);
          return err;
        }),
        finalize(() => {
          console.log(this.sales);
        })
      )
      .subscribe();
  }

  updateSales() {
    const today = new Date().toISOString().split('T')[0];
    const profit = Number(sessionStorage.getItem('totalPrice')) || 0;

    if (!this.sales) this.sales = {};

    if (!this.sales[today]) this.sales[today] = [];

    this.sales[today].push({
      profit,
      timestamp: new Date().toISOString(),
    });

    this.http
      .sendToAdmin('sales', this.sales)
      .pipe(
        takeUntil(this.destroy$),
        tap((data: any) => {
          console.log('Updated sales:', this.sales);
          this.popUp.show('Sale recorded successfully!', 'green');
          window.location.href = '/';
        }),
        catchError((err) => {
          console.error('Failed to update sales:', err);
          this.popUp.show('Failed to record sale', 'red');
          return err;
        }),
        finalize(() => {
          console.log(this.sales);
        })
      )
      .subscribe();
  }

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
    let v = input.value.replace(/\D/g, '');
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

    this.http
      .checkout(this.headers)
      .pipe(
        takeUntil(this.destroy$),
        tap((data) => {
          console.log(data);
          this.popUp.show('Checkout successful!', 'green');
          this.updateSales();
        }),
        catchError((err) => {
          console.log(err);
          return err;
        }),
        finalize(() => {
          console.log('done');
        })
      )
      .subscribe();
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
