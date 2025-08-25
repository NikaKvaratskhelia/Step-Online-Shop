import { Component } from '@angular/core';
import { ToolsService } from '../../tools.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reviewer-profile',
  imports: [CommonModule],
  templateUrl: './reviewer-profile.component.html',
  styleUrl: './reviewer-profile.component.scss',
})
export class ReviewerProfileComponent {
  id: string | null = '';
  user: any;
  loading: boolean = false;
  constructor(private tools: ToolsService, private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getReviewer();
  }

  getReviewer() {
    this.loading = true;

    this.tools.getReviewer(this.id).subscribe({
      next: (data: any) => {
        this.user = data;
        console.log('Reviewer data:', data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching reviewer:', err);
        this.user = null; 
        this.loading = false;
      },
      complete: () => {
        console.log('Reviewer fetch completed.');
      },
    });
  }
}
