import { Component, OnDestroy } from '@angular/core';
import { ToolsService } from '../../Services/tools.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, tap, pipe, catchError, finalize, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reviewer-profile',
  imports: [CommonModule],
  templateUrl: './reviewer-profile.component.html',
  styleUrl: './reviewer-profile.component.scss',
})
export class ReviewerProfileComponent implements OnDestroy {
  id: string | null = '';
  user: any;
  loading: boolean = false;

  private destroyed$ = new Subject();

  constructor(private tools: ToolsService, private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getReviewer();
  }
  ngOnDestroy(): void {
    this.destroyed$.next;
    this.destroyed$.complete();
  }

  getReviewer() {
    this.loading = true;

    this.tools
      .getReviewer(this.id)
      .pipe(
        takeUntil(this.destroyed$),
        tap((data: any) => {
          this.user = data;
          console.log('Reviewer data:', data);
          this.loading = false;
        }),
        catchError((err) => {
          console.error('Error fetching reviewer:', err);
          this.user = null;
          this.loading = false;

          return err;
        }),
        finalize(() => {
          console.log('Reviewer fetch completed.');
        })
      )
      .subscribe();
  }
}
