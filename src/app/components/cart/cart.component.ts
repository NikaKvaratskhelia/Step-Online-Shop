import { Component } from '@angular/core';
import { ToolsService } from '../../tools.service';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
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

  getCart() {
    this.isLoading = true;
    this.cartItems = [];

    this.http.getCart().subscribe((res: any) => {
      const products = res.body.products;

      this.cartItems = products.map((item: any) => ({
        ...item,
        productDetails: null,
      }));

      let loaded = 0;

      if(products.length===0) this.isLoading= false

      products.forEach((item: any, index: number) => {
        this.http.getProductId(item.productId).subscribe((productData: any) => {
          this.cartItems[index].productDetails = productData;
          loaded++;
          if (loaded === products.length) {
            this.isLoading = false;
          }
        });
      });
    });
  }

  increaseQty(item: any) {
    const newQty = item.quantity + 1;
    this.http
      .addToCart({ id: item.productId, quantity: newQty }, this.headers)
      .subscribe(() => {
        item.quantity = newQty;
      });
  }

  decreaseQty(item: any) {
    if (item.quantity > 1) {
      const newQty = item.quantity - 1;
      this.http
        .addToCart({ id: item.productId, quantity: newQty }, this.headers)
        .subscribe(() => {
          item.quantity = newQty;
        });
    }
  }

  removeFromCart(item: any) {
    this.http
      .deleteCartItem(item.productId, this.headers)
      .subscribe(() => this.getCart());
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => {
      if (!item.productDetails) return sum;
      return sum + item.quantity * item.productDetails.price.current;
    }, 0);
  }
}
