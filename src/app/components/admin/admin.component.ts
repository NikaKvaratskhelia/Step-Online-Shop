import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToolsService } from '../../Services/tools.service';
import {
  catchError,
  finalize,
  forkJoin,
  Subject,
  takeUntil,
  tap,
  of,
  map,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-admin',
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnDestroy {
  constructor(private tools: ToolsService) {
    this.getAdminInfo();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public maxPrice: number = 0;
  public adminInfo: any;
  public destroyed$ = new Subject<void>();
  public loading = false;
  public mostVieweds: any[] = [];
  public lastWeek: any[] = [];
  public lastMonth: any[] = [];
  public lastWeekTotal: number = 0;
  public lastMonthTotal: number = 0;
  public prevLastWeekTotal: number = 0;
  public prevLastMonthTotal: number = 0;
  public wantedAnalytics: 'week' | 'month' = 'week';
  public prevWeek: any[] = [];
  public prevMonth: any[] = [];
  public weeklyRevenue: number = 0;
  public monthlyRevenue: number = 0;

  getAdminInfo() {
    this.loading = true;
    this.tools
      .getAdminArrs()
      .pipe(
        takeUntil(this.destroyed$),
        tap((data: any) => {
          this.adminInfo = data;
          this.fetchSales();

          this.getMostVieweds().subscribe((data) => {
            this.mostVieweds = data;
          });
        }),
        catchError((err) => {
          console.error(err);
          return of([]);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe();
  }

  getRevenues() {
    this.weeklyRevenue = Math.round(
      ((this.lastWeekTotal - this.prevLastWeekTotal) / this.prevLastWeekTotal) *
        100
    );

    this.monthlyRevenue = Math.round(
      ((this.lastMonthTotal - this.prevLastMonthTotal) /
        this.prevLastMonthTotal) *
        100
    );
  }

  getMostVieweds() {
    const viewed = this.adminInfo?.viewedProducts;
    if (!Array.isArray(viewed) || !viewed.length) return of([]);

    const counts = viewed.slice(-50).reduce((acc: any, id: string) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    const sortedIds = Object.entries(counts)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    return sortedIds.length
      ? forkJoin(sortedIds.map((id) => this.tools.getProductId(id)))
      : of([]);
  }

  fetchSales() {
    if (!this.adminInfo?.sales) {
      this.lastWeek = [];
      this.lastMonth = [];
      return;
    }
    const today = new Date();

    const generateDateArray = (days: number) => {
      return Array.from({ length: days }, (_, i) => {
        const day = new Date(today);
        day.setDate(today.getDate() - (days - 1 - i));
        const dateKey = day.toISOString().split('T')[0];
        const daySales = this.adminInfo!.sales[dateKey] || [];
        const total = daySales.reduce(
          (sum: any, entry: any) => sum + Number(entry.profit || 0),
          0
        );
        return { date: dateKey, total };
      });
    };

    this.lastWeek = generateDateArray(7);
    this.prevWeek = generateDateArray(14).slice(0, 7);
    this.prevMonth = generateDateArray(60).slice(0, 30);
    this.lastMonth = generateDateArray(30);

    console.log('Last 7 days sales:', this.lastWeek);
    console.log('Last 30 days sales:', this.lastMonth);

    console.log(this.prevWeek, this.prevMonth);

    this.getTotalPrices();
    this.getMaxSalePrice();
    this.getRevenues();
  }

  getTotalPrices() {
    this.lastWeekTotal = 0;
    this.lastMonthTotal = 0;
    this.prevLastMonthTotal = 0;
    this.prevLastWeekTotal = 0;

    this.lastWeek.forEach((s) => (this.lastWeekTotal += s.total));
    this.lastMonth.forEach((s) => (this.lastMonthTotal += s.total));
    this.prevMonth.forEach((s) => (this.prevLastMonthTotal += s.total));
    this.prevWeek.forEach((s) => (this.prevLastWeekTotal += s.total));
  }

  getMaxSalePrice() {
    if (this.wantedAnalytics === 'month') {
      if (!this.lastMonth || this.lastMonth.length === 0) {
        this.maxPrice = 0;
        return;
      }

      this.maxPrice = Math.max(...this.lastMonth.map((sale) => sale.total));
    } else {
      if (!this.lastWeek || this.lastWeek.length === 0) {
        this.maxPrice = 0;
        return;
      }

      this.maxPrice = Math.max(...this.lastWeek.map((sale) => sale.total));
    }
  }
}
