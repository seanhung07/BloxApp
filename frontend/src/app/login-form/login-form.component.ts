import {Component, OnInit} from '@angular/core';
import {getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup} from "firebase/auth";
import {Router} from '@angular/router';
import {HttpService} from "../http.service";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  provider:any;
  user:any;

  constructor(private route: Router, private httpService: HttpService) { }

  ngOnInit(): void {
    this.provider = new GoogleAuthProvider()

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      // console.log(user)
      this.route.navigate(['/'])
      // ...
    } else {
      // User is signed out
      // ...
    }
  });
  }
  loginWithGmail(){
    const auth = getAuth();
    signInWithPopup(auth, this.provider)
  .then(async (result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const user = result.user;
    const email:any = user.email;
    const uid:any = user.uid;
    window.localStorage.setItem('email', email);
    window.localStorage.setItem('uid', uid);
    user.getIdToken().then((token)=>{
      window.localStorage.setItem('blox-firebase-token', token);
    })
    // Creates an account with the backend immediately
    await this.httpService.getAccountData();
    // window.localStorage.setItem('blox-firebase-token', user.accessToken);
    // console.log(user.email)
    // ...
  }).catch((error) => {
    console.error(error);
  });
  }
}
