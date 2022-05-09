import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form.component';
import { SignupComponent } from './signup/signup.component';
import { TradingFormComponent } from './trading-form/trading-form.component';

import { NewsComponent } from './news/news.component';
import { TradingComponent } from './trading/trading.component'
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';
import { AccountComponent } from './account/account.component';
import {WalletsComponent} from "./wallets/wallets.component";
import {WalletViewComponent} from "./wallet-view/wallet-view.component";
// const redirectLoggedInToItems = () => redirectLoggedInTo(['items']);
const routes: Routes = [
  { path: '', redirectTo: '/portfolio', pathMatch: 'full' }, // need to revise so only logged in users can view
  {path: 'login', component: LoginFormComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'news', component: NewsComponent},
  {path: 'trading', component: TradingComponent},
  {path: 'leaderboard', component: LeaderboardComponent},
  {path: 'portfolio', component: TradingFormComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'trade', component: TradingFormComponent},
  {path: 'wallets', component: WalletsComponent},
  {path: 'wallets/:address', component: WalletViewComponent},
  {path: 'trade', component: TradingFormComponent},
  {path: 'disclaimer', component: DisclaimerComponent},
  {path: 'account', component: AccountComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [LoginFormComponent]
