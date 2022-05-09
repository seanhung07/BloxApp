import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signOut } from "firebase/auth";
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  collapsed = true;

  constructor(
    private route:Router
  ) { }

  ngOnInit(): void {
  }
  onLogout(){
    const auth = getAuth();
    signOut(auth).then(() => {
      localStorage.clear();
      this.route.navigate(['/login'])
    }).catch((error) => {
      // An error happened.
    });


  }

}
