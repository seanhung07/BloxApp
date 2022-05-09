import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {HttpService} from "../http.service";
import { getAuth, onAuthStateChanged } from "firebase/auth";

@Component({
  selector: 'app-trading-form',
  templateUrl: './trading-form.component.html',
  styleUrls: ['./trading-form.component.css']
})

export class TradingFormComponent implements OnInit {

  tradeForm = new FormGroup({
    toTradeSymbol: new FormControl(''),
    quantity: new FormControl(0),
    action: new FormControl(''),
    walletAddress: new FormControl('')
  });
  wallets: any = {};
  crypto: any = {};

  constructor(private route: Router, private httpService: HttpService) { }

  ngOnInit(): void {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        this.route.navigate(['/login'])
      }
      this.wallets = await this.httpService.getWallets();
      this.crypto = await this.httpService.getCrypto();
    });

  }

  async tradeSubmit(){
    if((this.tradeForm.value).toTradeSymbol == ''){
      alert("Please put in a Crypto symbol! (Ex. BTC, ETH, USDT, etc.)");
    } else if ((this.tradeForm.value).action == ''){
      alert("Please indicate if you want to buy or sell.");
    } else if ((this.tradeForm.value).quantity <= 0){
      alert("Please put a quantity that is greater than 0.");
    } else if ((this.tradeForm.value).walletAddress == ''){
      alert("Please insert your wallet!");
    } else{
      try {
        alert("Submitting trade...")
        await this.httpService.postTransaction(
          (this.tradeForm.value).toTradeSymbol,
          (this.tradeForm.value).walletAddress,
          parseFloat((this.tradeForm.value).quantity),
          (this.tradeForm.value).action
        );
        alert("Trade complete!");
      } catch(e: any) {
        console.log(e);
        let message = e.error?.error || e.message
        alert("Trade failed: " + message);
      }
    }
  }
}
