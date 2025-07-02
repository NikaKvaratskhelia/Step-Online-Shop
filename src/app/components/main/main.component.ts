import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsService } from '../../tools.service';
import { HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  public allProducts: any[] = [];
  public pageList: number[] = [];
  public categories: any[] = [];
  public brands: string[] = [];
  public myPageIndex: number = 1;
  public showFilter: boolean = false;
  public selectedProductId: string | null = null;
  public selectedProduct: any;

  public filterForm: FormGroup;

  public headers = new HttpHeaders({
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  });

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
  }

  loadInitialData() {
    this.getCategories();
    this.getBrands();
    this.getFilteredProducts();
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
    const url = this.buildUrl();
    this.tools.getFilteredProducts(url).subscribe({
      next: (res: any) => {
        this.allProducts = res.products || [];
        this.setupPagination(res.total || 0, res.limit || 6);
        this.myPageIndex = res.page || 1;
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
}
