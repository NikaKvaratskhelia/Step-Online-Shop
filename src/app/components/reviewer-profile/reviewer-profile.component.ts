import { Component } from '@angular/core';
import { ToolsService } from '../../tools.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reviewer-profile',
  imports: [],
  templateUrl: './reviewer-profile.component.html',
  styleUrl: './reviewer-profile.component.scss',
})
export class ReviewerProfileComponent {
  id: string | null = '';
  user: any;
  constructor(private tools: ToolsService, private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getReviewer()
  }

  getReviewer() {
    this.tools.getReviewer(this.id).subscribe((data: any) => {
        this.user = data;
        console.log('Reviewer data:', data);
    });
  }
}
