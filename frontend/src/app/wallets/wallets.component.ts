import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpService} from "../http.service";
import {Router} from "@angular/router";
import {getAuth, onAuthStateChanged} from "firebase/auth";

@Component({
  selector: 'app-wallets',
  templateUrl: './wallets.component.html',
  styleUrls: ['./wallets.component.css']
})
export class WalletsComponent implements OnInit {

  @ViewChild('balance')
  balanceInput: ElementRef|undefined = undefined;
  @ViewChild('name')
  nameInput: ElementRef|undefined = undefined;

  constructor(private httpService: HttpService, private route: Router) { }

  wallets: any[] = [];

  async ngOnInit(): Promise<void> {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.route.navigate(['/login'])
      }
    });

    this.wallets = await this.httpService.getWallets()
  }

  async createWallet(): Promise<void> {
    const name = this.nameInput?.nativeElement.value;
    const balance = this.balanceInput?.nativeElement.value ?? 0;
    await this.httpService.createWallet(name, balance);
    this.wallets = await this.httpService.getWallets();
  }

}
