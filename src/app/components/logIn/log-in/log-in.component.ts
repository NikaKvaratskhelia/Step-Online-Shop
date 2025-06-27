import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { ToolsService } from '../../../tools.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
})
export class LogInComponent {
  public logInActive: boolean = false;
  public operation: string = 'login';
  public sentPassword: boolean = false;
  public sentRecovery: boolean = false;
  public countdown: number = 0;
  public countdownInterval: any;


  constructor(private tools: ToolsService, private router: Router) {}

  openLogIn() {
    this.logInActive = true;
  }

  closeLogIn() {
    this.operation = 'login';
    this.logInActive = false;
  }

  showRegistration() {
    this.operation = 'registration';
  }

  showLogIn() {
    this.operation = 'login';
  }

  showResetPassword() {
    this.operation = 'password';
  }

  ngOnInit() {
    this.tools.loginVisible$.subscribe((visible: boolean) => {
      this.logInActive = visible;
    });
  }

  public signUpInfo: FormGroup = new FormGroup({
    firstName: new FormControl(),
    lastName: new FormControl(),
    address: new FormControl(),
    email: new FormControl(),
    password: new FormControl(),
    phone: new FormControl(),
  });

  public signInInfo: FormGroup = new FormGroup({
    email: new FormControl(),
    password: new FormControl(),
  });

  public recovery: FormGroup = new FormGroup({
    email: new FormControl(),
  });

  prepareName(fullName: string) {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    this.signUpInfo.patchValue({
      firstName,
      lastName,
    });
  }

  signIn() {
    this.tools.signIn(this.signInInfo.value).subscribe((data: any) => {
      sessionStorage.setItem('token', data.access_token);
      this.tools.setLoggedIn(true);
      this.router.navigate(['/home']);
    });
  }

  signUp() {
    this.tools
      .signUp(this.signUpInfo.value)
      .subscribe((data) => console.log(data));
  }

  recoverPassword() {
  this.tools.recoverPassword(this.recovery.value).subscribe((data: any) => {
    console.log(data)
    if (data.status === 200) {
      this.sentRecovery = true;
      this.countdown = 60; 

      this.countdownInterval = setInterval(() => {
        this.countdown--;
        if (this.countdown === 0) {
          clearInterval(this.countdownInterval);
          this.sentRecovery = false;
        }
      }, 1000);
    }
  });
}

}
