import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ToolsService } from '../../Services/tools.service';
import { HttpHeaders } from '@angular/common/http';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntil, Subject, tap, catchError, finalize } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  imports: [PopUpComponent, RouterModule, CommonModule],
})
export class CartComponent implements OnDestroy {
  public cartItems: any[] = [];
  public isLoading = true;
  private destroyed$ = new Subject();

  public headers = new HttpHeaders({
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  });

  constructor(private http: ToolsService) {
    this.getCart();
  }
  ngOnDestroy(): void {
    this.destroyed$.next;
    this.destroyed$.complete();
  }

  @ViewChild(PopUpComponent) popUp!: PopUpComponent;

  getCart() {
    this.isLoading = true;
    this.cartItems = [];

    this.http
      .getCart()
      .pipe(
        takeUntil(this.destroyed$),
        tap((res: any) => {
          const products = res.body.products;

          this.cartItems = products.map((item: any) => ({
            ...item,
            productDetails: null,
          }));

          console.log('Cart items:', this.cartItems);

          let loaded = 0;
          if (products.length === 0) this.isLoading = false;

          products.forEach((item: any, index: number) => {
            this.http
              .getProductId(item.productId)
              .pipe(
                takeUntil(this.destroyed$),
                tap((productData: any) => {
                  this.cartItems[index].productDetails = productData;
                  loaded++;
                  if (loaded === products.length) {
                    this.isLoading = false;
                  }
                }),
                catchError((err) => {
                  console.log(err);
                  return [];
                }),
                finalize(() => {
                  console.log('Function done');
                })
              )
              .subscribe();
          });
        }),
        catchError((err) => {
          if (
            err.status === 409 &&
            err.error?.error === 'User has to create cart first'
          ) {
            this.cartItems = [];
            this.isLoading = false;
          } else {
            console.error('Unexpected cart error:', err);
            this.isLoading = false;
          }

          return [];
        }),
        finalize(() => {
          console.log('Function done');
        })
      )
      .subscribe();
  }

  savePrice() {
    sessionStorage.setItem('totalPrice', `${this.getTotalPrice()}`);
    window.location.href = '/checkout';
  }

  increaseQty(item: any) {
    let currentQty = item.quantity;
    if (currentQty >= item.productDetails.stock) {
      this.popUp.show('Cannot increase quantity, stock limit reached!', 'red');
      return;
    } else {
      currentQty++;
      item.quantity = currentQty;
      this.http
        .addToCart({ id: item.productId, quantity: currentQty }, this.headers)
        .pipe(
          takeUntil(this.destroyed$),
          tap(() => {
            this.popUp.show('Quantity increased successfully!', 'green');
          }),
          catchError((err) => {
            console.log(err);
            return [];
          }),
          finalize(() => {
            console.log('Function done');
          })
        )
        .subscribe();
    }
  }

  decreaseQty(item: any) {
    if (item.quantity > 1) {
      const newQty = item.quantity - 1;
      this.http
        .addToCart({ id: item.productId, quantity: newQty }, this.headers)
        .pipe(
          takeUntil(this.destroyed$),
          tap(() => {
            item.quantity = newQty;
            this.popUp.show('Quantity decreased successfully!', 'green');
          }),
          catchError((err) => {
            console.log(err);
            return [];
          }),
          finalize(() => {
            console.log('Function done');
          })
        )
        .subscribe();
    } else {
      this.removeFromCart(item);
    }
  }

  removeFromCart(item: any) {
    this.http
      .deleteCartItem(item.productId, this.headers)
      .pipe(
        takeUntil(this.destroyed$),
        tap(() => {
          this.getCart();
          this.popUp.show('Item removed from cart!', 'red');
        }),
        catchError((err) => {
          console.log(err);
          return [];
        }),
        finalize(() => {
          console.log('Function done');
        })
      )
      .subscribe();
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => {
      if (!item.productDetails) return sum;
      return sum + item.quantity * item.productDetails.price.current;
    }, 0);
  }
}
