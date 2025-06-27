import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsService } from '../../tools.service';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  public allProducts: any[] = [];
  public pageList: number[] = [];
  public categories: any[] = [];
  public brands: string[] = [];
  public selectedCategoryID: number | null = null;
  public selectedBrand: string = '';
  public myPageIndex: number = 1;
  public showFilter: boolean = false;
  public selectedProductId: string | null = null;
  public selectedProduct: any;
  public userHasCart: boolean = false;

  constructor(private tools: ToolsService) {
    this.loadInitialData();
  }

  hasCart() {
    this.tools.getCart().subscribe({
      next: (res:any) => {
        this.userHasCart = res.status === 200;
        console.log('Cart exists:', this.userHasCart, res.body);
      },
      error: (err) => {
        this.userHasCart = false;
        console.error('Cart check failed:', err);
      },
    });
  }

  loadInitialData() {
    this.getCategories();
    this.getBrands();
    this.allProduct(1);
    this.hasCart();
  }

  allProduct(page: number) {
    this.selectedCategoryID = null;
    this.selectedBrand = '';
    this.tools.getProductsAll(page).subscribe((data: any) => {
      this.allProducts = data.products;
      this.setupPagination(data.total, data.limit);
      this.myPageIndex = page;
    });
  }

  setupPagination(total: number, limit: number) {
    const pageNum = Math.ceil(total / limit);
    this.pageList = [];
    for (let i = 1; i <= pageNum; i++) {
      this.pageList.push(i);
    }
  }

  getCategories() {
    this.tools
      .getCategories()
      .subscribe((data: any) => (this.categories = data));
  }

  getBrands() {
    this.tools.getBrands().subscribe((data: any) => (this.brands = data));
  }


  filter(
    brand: string = this.selectedBrand,
    categoryID: number | null = this.selectedCategoryID,
    page: number = 1
  ) {
    this.selectedBrand = brand;
    this.selectedCategoryID = categoryID;
    this.myPageIndex = page;
    console.log(
      'FILTER - brand:',
      brand,
      'category:',
      categoryID,
      'page:',
      page
    );

    if (categoryID === null && brand !== '') {
      console.log('filtered by brand');
      this.tools.getByBrand(brand, page).subscribe((data: any) => {
        this.allProducts = data.products;
        this.setupPagination(data.total, data.limit);
      });
    } else if (categoryID !== null && brand === '') {
      console.log('filtered by category');
      this.tools.getByCategory(categoryID, page).subscribe((data: any) => {
        this.allProducts = data.products;
        this.setupPagination(data.total, data.limit);
      });
    } else if (brand !== '' && categoryID !== null) {
      console.log('filtered by both');
      this.tools.getByBrand(brand, page).subscribe((data: any) => {
        const filtered = data.products.filter((item: any) => {
          return item.category?.id === categoryID;
        });

        this.allProducts = filtered;
        this.setupPagination(filtered.length, 6);
      });
    } else {
      console.log('all products');
      this.allProduct(page);
    }
  }

  resetFilters() {
    this.selectedCategoryID = null;
    this.selectedBrand = '';
    this.allProduct(1);
  }

  closeDetail() {
    this.selectedProductId = null;
    this.selectedProduct = {};
  }

  averageRating = 0;
  starsDisplay: ('full' | 'half' | 'empty')[] = [];

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

  openProductDetails(id: string) {
    console.log(this.userHasCart);
    this.selectedProductId = id;
    this.tools.getProductId(id).subscribe((data: any) => {
      this.selectedProduct = data;
      this.selectedCategoryID = data.category.id;
      if (data.ratings.length > 0) {
        const total = data.ratings.reduce(
          (sum: number, r: any) => sum + r.value,
          0
        );
        this.averageRating = total / data.ratings.length;
      } else {
        this.averageRating = 0;
      }
      this.updateStarsDisplay();
    });
  }

  public index: number = 0;

  prev() {
    if (this.index !== 0) {
      this.index--;
    }
  }

  next(list: any) {
    if (this.index === list.length - 1) {
      return;
    } else {
      this.index++;
    }
  }

  public headers = new HttpHeaders({
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  });

  addCreateToCart(id: any) {
    this.tools
      .addCreateToCart({ id: id, quantity: 1 }, this.headers)
      .subscribe((data: any) => {
        console.log(data);
        this.userHasCart = true;
      });
  }

  addToCart(id: any) {
    this.tools
      .addToCart({ id: id, quantity: 1 }, this.headers)
      .subscribe((data: any) => {
        console.log(data);
      });
  }
}
