import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToolsService } from '../../tools.service';
import { catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';
import { PopUpComponent } from '../pop-up/pop-up.component';

@Component({
  selector: 'app-favorites',
  imports: [RouterModule, CommonModule, PopUpComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent implements OnInit, OnDestroy {
  public favProductIDs: string[] = [];
  public favProducts: any[] = [];
  public id: string | null = JSON.parse(sessionStorage.getItem('user') || '{}')
    ._id;
  public destroy$ = new Subject();
  public hasError: boolean = false;
  public loading: boolean = false;

  private tools: ToolsService = inject(ToolsService);

  @ViewChild(PopUpComponent) popUpComponent!: PopUpComponent;

  constructor() {}
  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next;
    this.destroy$.complete();
  }

  loadData() {
    this.loading = true;
    this.tools
      .getMock(this.id)
      .pipe(
        takeUntil(this.destroy$),
        tap((data: any) => {
          console.log(data);
          this.favProductIDs = data.favorites;
        }),
        catchError(() => {
          this.hasError = true;
          return of('error');
        }),
        finalize(() => {
          this.loading = false;
          this.loadFavProducts();
        })
      )
      .subscribe();
  }

  loadFavProducts() {
    console.log('dawyeba');

    this.favProductIDs.forEach((id) => {
      this.getProduct(id);
    });
  }

  getProduct(id: string) {
    this.loading = true;
    this.tools
      .getProductId(id)
      .pipe(
        takeUntil(this.destroy$),
        tap((data) => {
          this.favProducts.push(data);
          console.log(this.favProducts);
        }),
        catchError(() => {
          this.hasError = true;
          return of('error');
        }),
        finalize(() => {
          console.log('dasruleba2');
          this.loading = false;
        })
      )
      .subscribe();
  }

  removeFromFavs(productId: string) {
    this.favProductIDs = this.favProductIDs.filter((id) => id !== productId);

    this.tools
      .addToFavs(this.id, this.favProductIDs)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.favProducts = this.favProducts.filter(
            (product) => product._id !== productId
          );
          this.popUpComponent.show('Product removed from favorites', 'green');
        }),
        catchError(() => {
          this.hasError = true;
          return of('error');
        })
      )
      .subscribe();
  }
}
