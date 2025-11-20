import { Component, Input, NgModule, OnInit, ViewChild } from '@angular/core';
import { ToolsService } from '../../Services/tools.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { PopUpComponent } from '../pop-up/pop-up.component';

@Component({
  selector: 'app-details',
  imports: [CommonModule, RouterModule, PopUpComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  id: string | null = '';
  public selectedProduct: any;
  public index: number = 0;
  averageRating = 0;
  starsDisplay: ('full' | 'half' | 'empty')[] = [];
  public userHasCart: boolean = false;
  public productExsistsInCart: boolean = false;
  public productInCart: any;
  public updating: boolean = false;
  public loading: boolean = false;
  public operation: 'details' | 'reviews' = 'details';
  public role: string = sessionStorage.getItem('role')!;
  public oldAdminArr: string[] = [];
  public headers = new HttpHeaders({
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  });

  @ViewChild(PopUpComponent) popUp!: PopUpComponent;

  constructor(private tools: ToolsService, private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.refreshCart();
  }

  refreshCart() {
    this.tools.getCart().subscribe((data: any) => {
      data.status === 200
        ? (this.userHasCart = true)
        : (this.userHasCart = false);

      data.body.products.forEach((product: any) => {
        if (product.productId === this.id) {
          this.productExsistsInCart = true;
          this.productInCart = product;
          console.log('Product exists in cart:', this.productInCart);
        }
      });
    });
  }

  sendToAdmin() {
    if (this.role === 'admin') return;

    this.tools.getAdminArrs().subscribe({
      next: (data: any) => {
        let viewedProducts;
        if (data.viewedProducts.length > 50) {
          viewedProducts = data.viewedProducts.slice(-50) || [];
        } else {
          viewedProducts = data.viewedProducts || [];
        }

        viewedProducts.push(this.selectedProduct._id);

        this.tools.sendToAdmin('viewedProducts', viewedProducts).subscribe({
          next: () => console.log('Sent to admin well'),
          error: (err) => console.error('Failed to send to admin', err),
        });
      },
      error: (err) => console.error('Failed to get admin array', err),
    });
  }

  ngOnInit(): void {
    this.openProductDetails();
    this.sendToAdmin();
  }

  prev(list: any) {
    if (this.index !== 0) {
      this.index--;
    } else {
      this.index = list.length - 1;
    }
  }

  next(list: any) {
    if (this.index === list.length - 1) {
      this.index = 0;
    } else {
      this.index++;
    }
  }

  openProductDetails() {
    this.loading = true;
    console.log('Opening product details for ID:', this.id);
    this.tools.getProductId(this.id).subscribe((data: any) => {
      this.selectedProduct = data;
      this.loading = false;

      if (data.ratings.length > 0) {
        const total = data.ratings.reduce(
          (sum: number, r: any) => sum + r.value,
          0
        );
        this.averageRating = total / data.ratings.length;
      } else {
        this.averageRating = 0;
      }

      console.log('Selected product:', this.selectedProduct);
      this.updateStarsDisplay();
      this.loadAllReviewers();
    });
  }

  updateStarsDisplay() {
    this.starsDisplay = [];
    const fullStars = Math.floor(this.averageRating);
    const hasHalfStar =
      this.averageRating - fullStars >= 0.25 &&
      this.averageRating - fullStars < 0.75;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        this.starsDisplay.push('full');
      } else if (i === fullStars && hasHalfStar) {
        this.starsDisplay.push('half');
      } else {
        this.starsDisplay.push('empty');
      }
    }
  }

  addToCart() {
    this.updating = true;
    if (this.userHasCart) {
      this.refreshCart();
    }
    setTimeout(() => {
      this.userHasCart
        ? this.productExsistsInCart
          ? this.tools
              .addToCart(
                { id: this.id, quantity: this.productInCart.quantity + 1 },
                this.headers
              )
              .subscribe((data: any) => {
                console.log('quantity');
                if (data && data.products) {
                  this.popUp.show(
                    'Product added to cart successfully!',
                    'green'
                  );
                } else {
                  this.popUp.show('Failed to add product to cart.', 'red');
                }
                this.refreshCart();
              })
          : this.tools
              .addToCart({ id: this.id, quantity: 1 }, this.headers)
              .subscribe((data: any) => {
                console.log('new product');
                if (data && data.products) {
                  this.popUp.show(
                    'Product added to cart successfully!',
                    'green'
                  );
                } else {
                  this.popUp.show('Failed to add product to cart.', 'red');
                }
                this.refreshCart();
              })
        : this.tools
            .addCreateToCart({ id: this.id, quantity: 1 }, this.headers)
            .subscribe({
              next: (data: any) => {
                console.log('create cart');
                if (data && data.products) {
                  this.popUp.show(
                    'Product added to cart successfully!',
                    'green'
                  );
                  this.userHasCart = true;
                } else {
                  this.popUp.show('Failed to add product to cart.', 'red');
                }
                this.refreshCart();
              },
              error: (err: any) => {
                console.error('Error adding product to cart:', err);
                this.popUp.show(`${err.error.error}`, 'red');
              },
            });

      this.updating = false;
    }, 1000);
  }

  reviewersMap: { [userId: string]: any } = {};

  loadAllReviewers() {
    this.selectedProduct.ratings.forEach((review: any) => {
      if (!this.reviewersMap[review.userId]) {
        this.tools.getReviewer(review.userId).subscribe((data: any) => {
          this.reviewersMap[review.userId] = data;
        });
      }
    });
    console.log('Reviewer data:', this.reviewersMap);
  }

  selectedRating: number = 0;
  hoveredRating: number = 0;

  setHover(rating: number) {
    this.hoveredRating = rating;
  }

  clearHover() {
    this.hoveredRating = 0;
  }
  selectRating(rating: number) {
    this.selectedRating = rating;
    console.log('User selected rating:', rating);
  }

  rate() {
    this.tools
      .addReview(this.id, this.selectedRating)
      .subscribe((data: any) => {
        this.popUp.show('Thank you for your review!', 'green');
        this.operation = 'reviews';
        this.openProductDetails();
      });
  }
}
