import {Component, ElementRef, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {HttpService} from "../http.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-wallet-view',
  templateUrl: './wallet-view.component.html',
  styleUrls: ['./wallet-view.component.css']
})
export class WalletViewComponent implements OnInit {

  constructor(private httpService: HttpService, private router: Router, private route: ActivatedRoute) { }

  @ViewChildren('balance')
  balanceFields: ElementRef[]|undefined = undefined;
  @ViewChild('name')
  nameInput: ElementRef|undefined = undefined;

  walletAddress: string|undefined;
  walletData: any = undefined;

  async ngOnInit(): Promise<void> {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.router.navigate(['/login'])
      }
    });

    this.walletAddress = this.route.snapshot.paramMap.get('address') ?? undefined
    if(!this.walletAddress) {
      this.router.navigate(['/wallets'])
      return;
    }
    this.walletData = await this.httpService.getWallet(this.walletAddress)
  }

  async updateWallet() {
    if(this.walletAddress === undefined) {
      return;
    }
    const updateObj: any = {
      name: this.nameInput?.nativeElement.value,
      balances: {}
    }
    this.balanceFields?.forEach((e) => {
      updateObj.balances[e.nativeElement.getAttribute('currency')] = parseFloat(e.nativeElement.value)
    })
    await this.httpService.updateWallet(this.walletAddress, updateObj);
  }

}
