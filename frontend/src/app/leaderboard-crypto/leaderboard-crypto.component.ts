import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leaderboard-crypto',
  templateUrl: './leaderboard-crypto.component.html',
  styleUrls: ['./leaderboard-crypto.component.css']
})
export class LeaderboardCryptoComponent implements OnInit {

   leaderboard: [string, number][] = [];


   constructor() { }
 
   update(PersonName: string, equityValueCrypto: number){
     // Don't add score if it's less than all values on the leaderboard.
     if(equityValueCrypto <= this.leaderboard[this.leaderboard.length - 1][1]) {
       return;
     }
 
     let x: [string, number];
     x = [PersonName, equityValueCrypto];
     this.leaderboard.push(x);
     this.leaderboard.sort(((a, b) => b[1] - a[1]));
     this.leaderboard = this.leaderboard.slice(0, 10);
 
   }
   ngOnInit(): void {
  }
}
