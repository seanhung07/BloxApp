import { Component, OnInit } from '@angular/core';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Router } from '@angular/router';
import {HttpService} from "../http.service";

interface DataBalanceItem {
   firstName: string;
   lastName: string;
   balance: number;
}

interface BalanceItem {
   rank: number;
   firstName: string;
   lastName: string;
   balance: number;
   formattedBalance: string;
}
@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {

   constructor(private route: Router, private httpService: HttpService) { }

   data_balance_items: DataBalanceItem[] = [];
   balance_items: BalanceItem[] = [];

   rankDirection : string = "arrow-up";

   maxBalance : number = Number.MAX_VALUE;
   minBalance : number = Number.MIN_VALUE;

   filterMaxBalance : number = Number.MAX_VALUE;
   filterMinBalance : number = Number.MIN_VALUE;

   filterMaxBalanceFormatted : string = "";
   filterMinBalanceFormatted : string = "";

   filterTopRank : number = Number.MAX_VALUE;
   maxRank : number = Number.MAX_VALUE;

   loading : boolean = true;

  ngOnInit(): void {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.route.navigate(['/login'])
        // ...
      }

      this.getLeaderNameAndBalances();
    });
  }

	// this gets called whenever anything on the table.component.html page changes (like the filter sliders)
	ngDoCheck(){
		this.refresh();
	}

  getLeaderNameAndBalances() {

   this.httpService.getLeaderNameAndBalances().subscribe((data: any) => {

      this.data_balance_items = [];

      if(data.error) {
        // TODO display an error message somewhere
        console.error(data.error);
      }

     // process all the data from the response JSON into a list
     // of DataBalanceItems (this list is kept around seperate from what
     // is shown on the html to allow for filtering and ranking)
      let dataJSON = data.data;

      for (const key in dataJSON)       {
         if (dataJSON.hasOwnProperty(key)) {
            let dataItem : DataBalanceItem = dataJSON[key];
            this.data_balance_items.push(dataItem);
         }
      }

      // now that all the data items are retrieved, we build a list of BalanceItems
      // which contain extra fields for rank and formatted-balance
		this.balance_items = [];

		this.data_balance_items.forEach(
			item => {
            let balanceItem : BalanceItem = {"rank":0,"firstName":item.firstName, "lastName":item.lastName, "balance":item.balance, "formattedBalance":"" };

            // format the balance as a dollar value
				balanceItem.formattedBalance="$" + item.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
				this.balance_items.push(balanceItem);
			}
		)

		this.refresh();

      if (this.balance_items.length == 0) {
         // no items
         return;
      }

		this.maxBalance = this.balance_items[0].balance + 1;
		this.minBalance = this.balance_items[this.balance_items.length - 1].balance - 1;

		this.filterMaxBalance = this.maxBalance;
		this.filterMinBalance = this.minBalance;

		this.filterTopRank = this.balance_items[this.balance_items.length - 1].rank;
		this.maxRank = this.filterTopRank;

		this.filterMaxBalanceFormatted = "$" + this.filterMaxBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
		this.filterMinBalanceFormatted = "$" + this.filterMinBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

      this.loading = false;

   })

}

getLatestLeaderNameAndBalances() {

   this.httpService.getLatestLeaderNameAndBalances().subscribe((data: any) => {

      this.data_balance_items = [];

      if(data.error) {
        // TODO display an error message somewhere
        console.error(data.error);
      }

     // process all the data from the response JSON into a list
     // of DataBalanceItems (this list is kept around seperate from what
     // is shown on the html to allow for filtering and ranking)
      let dataJSON = data.data;

      for (const key in dataJSON)       {
         if (dataJSON.hasOwnProperty(key)) {
            let dataItem : DataBalanceItem = dataJSON[key];
            this.data_balance_items.push(dataItem);
         }
      }

      // now that all the data items are retrieved, we build a list of BalanceItems
      // which contain extra fields for rank and formatted-balance
		this.balance_items = [];

		this.data_balance_items.forEach(
			item => {
            let balanceItem : BalanceItem = {"rank":0,"firstName":item.firstName, "lastName":item.lastName, "balance":item.balance, "formattedBalance":"" };

            // format the balance as a dollar value
				balanceItem.formattedBalance="$" + item.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
				this.balance_items.push(balanceItem);
			}
		)

		this.refresh();

      if (this.balance_items.length == 0) {
         // no items
         return;
      }

		this.maxBalance = this.balance_items[0].balance + 1;
		this.minBalance = this.balance_items[this.balance_items.length - 1].balance - 1;

		this.filterMaxBalance = this.maxBalance;
		this.filterMinBalance = this.minBalance;

		this.filterTopRank = this.balance_items[this.balance_items.length - 1].rank;
		this.maxRank = this.filterTopRank;

		this.filterMaxBalanceFormatted = "$" + this.filterMaxBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
		this.filterMinBalanceFormatted = "$" + this.filterMinBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

      this.loading = false;

   })

}

refreshList() {
   this.getLatestLeaderNameAndBalances();
}

refresh() {

   if (this.balance_items.length == 0) {
      // no items
      return;
   }

   // first sort the items based on balance
   this.balance_items.sort(function(a : BalanceItem, b : BalanceItem) {
      if (a.balance < b.balance) {
         return 1;
      } else if (a.balance == b.balance) {
         return 0;
      } else {
         return -1;
      }
   });

   // now rank the items based on balance
   let rank : number = 1;
   let prevBalance : number = this.balance_items[0].balance;

   this.balance_items.forEach(
      item => {
         if (item.balance < prevBalance || rank == 1) {
            item.rank = rank;
            rank += 1;
         } else {
            item.rank = rank - 1;
         }
         prevBalance = item.balance;
      }
   )

   if (this.rankDirection == "arrow-down") {
      // need to sort the items based on rank in descending order
      this.balance_items.sort(function(a : BalanceItem, b : BalanceItem) {
         if (a.rank < b.rank) {
            return 1;
         } else if (a.rank == b.rank) {
            return 0;
         } else {
            return -1;
         }
      });
   }

}

changeRankDirection() {
   if (this.rankDirection == "arrow-up") {
      this.rankDirection = "arrow-down";
   } else {
      this.rankDirection = "arrow-up";
   }
}

changeFilterMaxBalance(value : string) {
   this.filterMaxBalance = Number(value);

   this.filterMaxBalanceFormatted = "$" + this.filterMaxBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

   this.balance_items = [];

   this.data_balance_items.forEach(
      item => {
         if (item.balance >= this.filterMinBalance && item.balance <= this.filterMaxBalance) {
            let balanceItem : BalanceItem = {"rank":0,"firstName":item.firstName, "lastName":item.lastName, "balance":item.balance, "formattedBalance":"" };

				balanceItem.formattedBalance="$" + item.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            this.balance_items.push(balanceItem);
         }
      }
   )
}

changeFilterMinBalance(value : string) {
   this.filterMinBalance = Number(value);

   this.filterMinBalanceFormatted = "$" + this.filterMinBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

   this.balance_items = [];

   this.data_balance_items.forEach(
      item => {
         if (item.balance >= this.filterMinBalance && item.balance <= this.filterMaxBalance) {
            let balanceItem : BalanceItem = {"rank":0,"firstName":item.firstName, "lastName":item.lastName, "balance":item.balance, "formattedBalance":"" };

				balanceItem.formattedBalance="$" + item.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            this.balance_items.push(balanceItem);
         }
      }
   )
}

changeFilterTopRank(value : string) {

   this.filterTopRank = Number(value);

}



}
