import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ToolsService } from '../../../tools.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  public isLoggedIn: boolean = false;
  public menuIsOpen: boolean = false;
  private loginSub!: Subscription;
  public roleSub!: Subscription;
  public role: string = '';

  constructor(private router: Router, private tools: ToolsService) {}

  ngOnInit() {
    this.loginSub = this.tools.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });

    this.roleSub = this.tools.role$.subscribe((status) => {
      this.role = status;
    });

    console.log(this.roleSub, this.role, this.loginSub, this.isLoggedIn)
  }

  ngOnDestroy() {
    this.loginSub.unsubscribe();
  }

  toggleMenu() {
    this.menuIsOpen = !this.menuIsOpen;
  }

  triggerLogin() {
    this.tools.showLogin();
  }

  signOut() {
    this.tools.signOut();
    this.menuIsOpen = false;
    this.router.navigate(['/']);
  }
}
