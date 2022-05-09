import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule }   from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule , routingComponents} from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { AccountEquityComponent } from './account-equity/account-equity.component';
import { PerformanceGraphComponent } from './performance-graph/performance-graph.component';
import { TradingFormComponent } from './trading-form/trading-form.component';
import { TradingChartComponent } from './trading-chart/trading-chart.component';
import { HoldingComponent } from './holding/holding.component';
import { LeaderboardStockComponent } from './leaderboard-stock/leaderboard-stock.component';
import { LeaderboardCryptoComponent } from './leaderboard-crypto/leaderboard-crypto.component';
import { NewsComponent } from './news/news.component';
import { SignupComponent } from './signup/signup.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { TradingComponent } from './trading/trading.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { TradingViewComponent } from './trading-form/trading-view/trading-view.component';
import { WalletsComponent } from './wallets/wallets.component';
import { BitcoinChartComponent } from './trading-form/bitcoin-chart/bitcoin-chart.component';
import { WalletViewComponent } from './wallet-view/wallet-view.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';
import { AccountComponent } from './account/account.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    AccountEquityComponent,
    PerformanceGraphComponent,
    TradingFormComponent,
    TradingChartComponent,
    HoldingComponent,
    LeaderboardStockComponent,
    LeaderboardCryptoComponent,
    NewsComponent,
    routingComponents,
    SignupComponent,
    TradingViewComponent,
    SignupComponent,
    PortfolioComponent,
    TradingComponent,
    LeaderboardComponent,
    WalletsComponent,
    BitcoinChartComponent,
    WalletViewComponent,
    LeaderboardComponent,
    DisclaimerComponent,
    AccountComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
