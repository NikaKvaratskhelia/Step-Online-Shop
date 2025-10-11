import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ToolsService } from '../../tools.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { catchError, finalize, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, PopUpComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnDestroy {
  user: any;
  baseUrl: string = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=';
  firstIndex: number = Math.floor(Math.random() * 10);
  secondIndex: number = Math.floor(Math.random() * 10);
  thirdIndex: number = Math.floor(Math.random() * 10);
  chosenAvatar: string | null = null;
  public firstName: string | null = null;
  public lastName: string | null = null;
  public phone: string | null = null;
  public address: string | null = null;
  public showAltPfps: boolean = false;
  public oldPassword: string | null = null;
  public newPassword: string | null = null;
  public showAlert: boolean = false;
  public destroy$ = new Subject();

  @ViewChild(PopUpComponent) popUp!: PopUpComponent;
  constructor(private tools: ToolsService) {
    this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
  }

  ngOnDestroy(): void {
    this.destroy$.next;
    this.destroy$.complete();
  }

  reGenerateAvatars() {
    this.firstIndex = Math.floor(Math.random() * 10);
    this.secondIndex = Math.floor(Math.random() * 10);
    this.thirdIndex = Math.floor(Math.random() * 10);
    this.showAltPfps = true;
  }

  updateAvatar(avatar: string) {
    this.chosenAvatar = avatar;
    this.user.avatar = avatar;
  }

  updateUserInfo() {
  const updatedData = {
    firstName: this.firstName || this.user.firstName,
    lastName: this.lastName || this.user.lastName,
    age: this.user.age,
    address: this.address || this.user.address,
    phone: this.phone || this.user.phone,
    zipcode: this.user.zipcode,
    avatar: this.chosenAvatar || this.user.avatar,
    gender: this.user.gender,
  };

  this.tools
    .updateUserInfo(updatedData)
    .pipe(
      takeUntil(this.destroy$),
      tap((data: any) => {
        console.log('Updated main user:', data);
        sessionStorage.setItem('user', JSON.stringify(data));
        this.popUp.show('Profile updated successfully', 'green');
        this.user = data;

        this.tools
          .changeInfoMock(this.user._id, {
            name: updatedData.firstName,
            surname: updatedData.lastName,
          })
          .pipe(
            tap(() => console.log('Mock user updated')),
            catchError(() => {
              console.warn('Mock update failed');
              return [];
            })
          )
          .subscribe();
      }),
      catchError(() => {
        this.popUp.show('Failed to update profile', 'red');
        return [];
      })
    )
    .subscribe();
}


  updatePassword() {
    this.tools
      .changePassword({
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
      })
      .pipe(
        takeUntil(this.destroy$),
        tap((data: any) => {
          this.oldPassword = null;

          if (data.access_token) {
            this.popUp.show('Password updated successfully', 'green');
            sessionStorage.setItem('token', data.access_token);

            this.tools
              .changePassMock(this.user._id, this.newPassword)
              .subscribe({
                next: () => console.log('Mock password updated'),
                error: (e) => console.error('Mock update failed:', e),
              });

            this.newPassword = null;
          }
        }),
        catchError((err: any) => {
          console.error(err);
          this.popUp.show(err.error?.error || 'Password update failed', 'red');
          return [];
        })
      )
      .subscribe();
  }

  prepareForPassChange() {
    if (this.newPassword === null || this.oldPassword === null) {
      this.popUp.show('Please fill in both fields', 'red');
    } else if (this.oldPassword === this.newPassword) {
      this.popUp.show('New password cannot be the same as old password', 'red');
    } else {
      this.updatePassword();
    }
  }

  deleteAccount() {
    this.tools.deleteAccount().subscribe((data: any) => {
      console.log(data);
      if (data.acknowledged) {
        this.popUp.show('Account deleted successfully', 'green');
        sessionStorage.clear();
        window.location.href = '/';
      }
    });
  }

  verifyEmail() {
    this.tools
      .verifyEmail(sessionStorage.getItem('email'))
      .subscribe((data: any) => {
        console.log(data);
        if (data.status === 200) {
          this.popUp.show('Verification email sent successfully', 'green');
        } else {
          this.popUp.show('Failed to send verification email', 'red');
        }
      });
  }
}
