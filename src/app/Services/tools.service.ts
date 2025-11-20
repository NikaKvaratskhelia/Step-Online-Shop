import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToolsService {
  constructor(private http: HttpClient) {}

  // Get all products with pagination
  getProductsAll(page: number): Observable<any> {
    return this.http.get(
      `https://api.everrest.educata.dev/shop/products/all?page_index=${page}&page_size=6`
    );
  }

  // Get all categories
  getCategories(): Observable<any> {
    return this.http.get(
      'https://api.everrest.educata.dev/shop/products/categories'
    );
  }

  // Get all brands
  getBrands(): Observable<any> {
    return this.http.get(
      'https://api.everrest.educata.dev/shop/products/brands'
    );
  }

  // Get Products By Brand
  getByBrand(brand: string, page: number = 1) {
    return this.http.get(
      `https://api.everrest.educata.dev/shop/products/brand/${brand}?page_index=${page}&page_size=6`
    );
  }

  // Get Products By Category
  getByCategory(categoryID: number | null, page: number = 1) {
    return this.http.get(
      `https://api.everrest.educata.dev/shop/products/category/${categoryID}?page_index=${page}&page_size=6`
    );
  }

  getProductId(id: string | null) {
    return this.http.get(
      `https://api.everrest.educata.dev/shop/products/id/${id}`
    );
  }

  addCreateToCart(info: any, header: any) {
    return this.http.post(
      `https://api.everrest.educata.dev/shop/cart/product`,
      info,
      { headers: header }
    );
  }

  addToCart(info: any, header: any) {
    return this.http.patch(
      `https://api.everrest.educata.dev/shop/cart/product`,
      info,
      { headers: header }
    );
  }

  getCart() {
    return this.http.get(`https://api.everrest.educata.dev/shop/cart`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      },
      observe: 'response' as const,
    });
  }

  deleteCartItem(id: string, headers: any) {
    return this.http.request(
      'delete',
      'https://api.everrest.educata.dev/shop/cart/product',
      {
        headers,
        body: { id },
      }
    );
  }

  checkout(headers: HttpHeaders) {
    return this.http.post(
      `https://api.everrest.educata.dev/shop/cart/checkout`,
      {},
      { headers }
    );
  }

  getFilteredProducts(url: string) {
    return this.http.get(url);
  }

  // ----------- Authentication & UI state ---------------

  private loginVisible = new BehaviorSubject<boolean>(false);
  public loginVisible$ = this.loginVisible.asObservable();

  showLogin() {
    this.loginVisible.next(true);
  }

  signIn(info: any) {
    return this.http.post(
      `https://api.everrest.educata.dev/auth/sign_in`,
      info
    );
  }

  signUp(info: any) {
    return this.http.post(`https://api.everrest.educata.dev/auth/sign_up`, {
      ...info,
      age: 18,
      gender: 'MALE',
      zipcode: '0160',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Jane',
    });
  }

  signUpMock(info: any) {
    return this.http.post(`https://68ea6a32f1eeb3f856e7322d.mockapi.io/users`, {
      info,
    });
  }

  getMock(id: any) {
    return this.http.get(
      `https://68ea6a32f1eeb3f856e7322d.mockapi.io/users/${id}`
    );
  }

  addToFavs(id: any, info: any) {
    return this.http.put(
      `https://68ea6a32f1eeb3f856e7322d.mockapi.io/users/${id}`,
      { favorites: info }
    );
  }

  changeInfoMock(id: string, info: any) {
    return this.http.put(
      `https://68ea6a32f1eeb3f856e7322d.mockapi.io/users/${id}`,
      info
    );
  }

  changePassMock(id: string, val: any) {
    return this.http.put(
      `https://68ea6a32f1eeb3f856e7322d.mockapi.io/users/${id}`,
      { password: val }
    );
  }

  signOut() {
    sessionStorage.clear();
    this.setLoggedIn(false);
  }

  recoverPassword(info: any) {
    return this.http.post(
      `https://api.everrest.educata.dev/auth/recovery`,
      info
    );
  }

  sendToAdmin(key: string, val: string[]) {
    return this.http.put(`https://68ea6a32f1eeb3f856e7322d.mockapi.io/admin/1`, {
      [key]: val,
    });
  }

  getAdminArrs() {
    return this.http.get(`https://68ea6a32f1eeb3f856e7322d.mockapi.io/admin/1`);
  }

  private isLoggedInSubject = new BehaviorSubject<boolean>(
    !!sessionStorage.getItem('token')
  );
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private roleSubject = new BehaviorSubject<string>(
    sessionStorage.getItem('role')!
  );

  public role$ = this.roleSubject.asObservable();

  setLoggedIn(value: boolean) {
    this.isLoggedInSubject.next(value);
  }

  setRole(value: string) {
    this.roleSubject.next(value);
  }

  getUser() {
    return this.http.get(`https://api.everrest.educata.dev/auth`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      },
    });
  }

  getReviewer(id: string | null) {
    return this.http.get(`https://api.everrest.educata.dev/auth/id/${id}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      },
    });
  }

  updateUserInfo(user: any) {
    return this.http.patch(
      `https://api.everrest.educata.dev/auth/update`,
      user,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      }
    );
  }

  changePassword(info: any) {
    return this.http.patch(
      `https://api.everrest.educata.dev/auth/change_password`,
      info,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      }
    );
  }

  deleteAccount() {
    return this.http.delete(`https://api.everrest.educata.dev/auth/delete`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      },
    });
  }

  addReview(productId: string | null, rating: number | null) {
    return this.http.post(
      `https://api.everrest.educata.dev/shop/products/rate`,
      {
        productId: productId,
        rate: rating,
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      }
    );
  }

  verifyEmail(param: any) {
    return this.http.post(
      `https://api.everrest.educata.dev/auth/verify_email`,
      { email: param }
    );
  }
}
