import { Component, ViewChild } from '@angular/core';
import { ToolsService } from '../../tools.service';
import { HttpHeaders } from '@angular/common/http';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  imports: [PopUpComponent, RouterModule],
})
export class CartComponent {
  public cartItems: any[] = [];
  public isLoading = true;

  public headers = new HttpHeaders({
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  });

  constructor(private http: ToolsService) {
    this.getCart();
  }

  @ViewChild(PopUpComponent) popUp!: PopUpComponent;

  getCart() {
  this.isLoading = true;
  this.cartItems = [];

  this.http.getCart().subscribe({
    next: (res: any) => {
      const products = res.body.products;


      this.cartItems = products.map((item: any) => ({
        ...item,
        productDetails: null,
      }));

      let loaded = 0;
      if (products.length === 0) this.isLoading = false;
      
      products.forEach((item: any, index: number) => {
        this.http.getProductId(item.productId).subscribe((productData: any) => {
          this.cartItems[index].productDetails = productData;
          loaded++;
          if (loaded === products.length) {
            this.isLoading = false;
          }
        });
      });
    },
    error: (err) => {
      if (err.status === 409 && err.error?.error === 'User has to create cart first') {
        // Treat "no cart" as "empty cart"
        this.cartItems = [];
        this.isLoading = false;
      } else {
        console.error('Unexpected cart error:', err);
        this.popUp.show('Error loading cart', 'red');
        this.isLoading = false;
      }
    },
  });
}

  increaseQty(item: any) {
    const newQty = item.quantity + 1;
    this.http
      .addToCart({ id: item.productId, quantity: newQty }, this.headers)
      .subscribe(() => {
        item.quantity = newQty;
        this.popUp.show('Quantity increased successfully!', 'green');
      });
  }

  decreaseQty(item: any) {
    if (item.quantity > 1) {
      const newQty = item.quantity - 1;
      this.http
        .addToCart({ id: item.productId, quantity: newQty }, this.headers)
        .subscribe(() => {
          item.quantity = newQty;
          this.popUp.show('Quantity decreased successfully!', 'green');
        });
    } else {
      this.removeFromCart(item);
    }
  }

  removeFromCart(item: any) {
    this.http.deleteCartItem(item.productId, this.headers).subscribe(() => {
      this.getCart();
      this.popUp.show('Item removed from cart!', 'red');
    });
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => {
      if (!item.productDetails) return sum;
      return sum + item.quantity * item.productDetails.price.current;
    }, 0);
  }
}
