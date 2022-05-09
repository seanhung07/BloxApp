import { Component, OnInit } from '@angular/core';
import { getAuth, signInWithPopup, GoogleAuthProvider ,onAuthStateChanged } from "firebase/auth";
import { Router } from '@angular/router';
@Component({
  selector: 'app-trading',
  templateUrl: './trading.component.html',
  styleUrls: ['./trading.component.css']
})
export class TradingComponent implements OnInit {

  constructor(private route: Router) { }

  ngOnInit(): void {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.route.navigate(['/login'])
        // ...
      } 
    });
  }

}
