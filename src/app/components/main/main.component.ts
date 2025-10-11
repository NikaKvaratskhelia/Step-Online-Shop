import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsService } from '../../tools.service';
import { HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PopUpComponent } from '../pop-up/pop-up.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PopUpComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements AfterViewInit {
  public allProducts: any[] = [];
  public pageList: number[] = [];
  public categories: any[] = [];
  public brands: string[] = [];
  public myPageIndex: number = 1;
  public showFilter: boolean = false;
  public selectedProductId: string | null = null;
  public selectedProduct: any;
  public user: any = JSON.parse(sessionStorage.getItem('user') || '{}');
  public filterForm: FormGroup;
  public mockUser: any;
  public favorites: any[] = [];
  public loading: boolean = false;
  public comparing: any[] = [];
  public headers = new HttpHeaders({
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  });

  @ViewChild(PopUpComponent) popUp!: PopUpComponent;

  ngAfterViewInit(): void {
    this.getMockUser();
  }

  constructor(private tools: ToolsService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      page_index: [1],
      page_size: [6],
      keywords: [''],
      category_id: [''],
      brand: [''],
      rating: [''],
      price_min: [''],
      price_max: [''],
      sort_by: ['rating'],
      sort_direction: ['desc'],
    });

    this.filterForm.valueChanges.subscribe(() => this.getFilteredProducts());

    this.loadInitialData();

    this.tools.getUser().subscribe((data: any) => {
      console.log(data), sessionStorage.setItem('user', JSON.stringify(data));
    });
  }

  loadInitialData() {
    this.getCategories();
    this.getBrands();
    this.getFilteredProducts();
  }

  getMockUser() {
    this.tools.getMock(this.user._id).subscribe((data: any) => {
      console.log(data);
      this.mockUser = data;
      this.favorites = data.favorites;
      console.log(this.user);
    });
  }

  changePage(page: number) {
    this.myPageIndex = page;
    this.filterForm.patchValue({ page_index: page });
  }

  getCategories() {
    this.tools
      .getCategories()
      .subscribe((data: any) => (this.categories = data));
  }

  getBrands() {
    this.tools.getBrands().subscribe((data: any) => (this.brands = data));
  }

  selectCategory(categoryID: number | null) {
    this.filterForm.patchValue({ category_id: categoryID, page_index: 1 });
  }

  selectBrand(brand: string) {
    this.filterForm.patchValue({ brand: brand, page_index: 1 });
  }

  addToFavs(id: string) {
    if (this.favorites.includes(id)) {
      this.popUp.show('Product is already in favorites', 'red');
      return;
    }

    this.favorites.push(id);

    this.tools.addToFavs(this.user._id, this.favorites).subscribe({
      next: (res: any) => {
        console.log(res);
        console.log(this.favorites, this.user._id);
        this.popUp.show('Product added to favorites', 'green');
      },
      error: (err: any) => {
        console.error(err);
        this.popUp.show('Failed to add to favorites', 'red');
      },
    });
  }

  resetFilters() {
    this.filterForm.patchValue({
      keywords: '',
      category_id: '',
      brand: '',
      rating: '',
      price_min: '',
      price_max: '',
      sort_by: 'rating',
      sort_direction: 'desc',
      page_index: 1,
    });
  }

  buildUrl(): string {
    const baseUrl = 'https://api.everrest.educata.dev/shop/products/search';
    const params: string[] = [];
    const values = this.filterForm.value;

    for (const key in values) {
      const val = values[key];
      if (val !== '' && val !== null && val !== undefined) {
        params.push(`${key}=${encodeURIComponent(val)}`);
      }
    }

    return `${baseUrl}?${params.join('&')}`;
  }

  getFilteredProducts() {
    this.loading = true;
    const url = this.buildUrl();
    this.tools.getFilteredProducts(url).subscribe({
      next: (res: any) => {
        this.allProducts = res.products || [];
        this.setupPagination(res.total || 0, res.limit || 6);
        this.myPageIndex = res.page || 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Filter request failed:', err);
      },
    });
  }

  setupPagination(total: number, limit: number) {
    const pageNum = Math.ceil(total / limit);
    this.pageList = Array.from({ length: pageNum }, (_, i) => i + 1);
  }

  addToCompare(product: any) {
    this.comparing.push(product);

    sessionStorage.setItem( "comparingProducts", JSON.stringify(this.comparing))
  }
}
