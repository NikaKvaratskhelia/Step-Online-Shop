import { Component } from '@angular/core';
import { ToolsService } from '../../tools.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  user: any;
  constructor(private tools: ToolsService) {
    this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
  }

}
