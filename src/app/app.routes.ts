import { Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CartComponent } from './components/cart/cart.component';
import { LogInComponent } from './components/logIn/log-in/log-in.component';
import { AuthGuard } from './auth.guard';
import { LoginGuard } from './login.guard';
import { DetailsComponent } from './components/details/details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ReviewerProfileComponent } from './components/reviewer-profile/reviewer-profile.component';
import { FavoritesComponent } from './components/favorites/favorites.component';

export const routes: Routes = [
  {
    path: '',
    component: LogInComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'home',
    component: MainComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'details/:id',
    component: DetailsComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'reviewer/:id',
    component: ReviewerProfileComponent,
    canActivate: [AuthGuard],
  },
  
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'favorites',
    component: FavoritesComponent,
    canActivate: [AuthGuard],
  },
];
