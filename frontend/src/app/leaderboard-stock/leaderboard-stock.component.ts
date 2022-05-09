import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-leaderboard-stock',
  templateUrl: './leaderboard-stock.component.html',
  styleUrls: ['./leaderboard-stock.component.css']
})
export class LeaderboardStockComponent implements OnInit {
   leaderboard: [string, number][] = [];


   constructor() { }
 
   update(PersonName: string, equityValue: number){
     // Don't add score if it's less than all values on the leaderboard.
     if(equityValue <= this.leaderboard[this.leaderboard.length - 1][1]) {
       return;
     }
 
     let x: [string, number];
     x = [PersonName, equityValue];
     this.leaderboard.push(x);
     this.leaderboard.sort(((a, b) => b[1] - a[1]));
     this.leaderboard = this.leaderboard.slice(0, 10);
 
   }
 
   ngOnInit(): void {
   }

}
