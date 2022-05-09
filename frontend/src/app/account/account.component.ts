import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {HttpService} from "../http.service";
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  id?: string;
  email: string = ''

  @ViewChild('fname')
  firstNameElem?: ElementRef
  @ViewChild('lname')
  lastNameElem?: ElementRef
  @ViewChild('accType')
  accountTypeElem?: ElementRef
  @ViewChild('accVisibility')
  accountVisibilityElem?: ElementRef

  constructor(private route: Router, private httpService: HttpService) { }

  ngOnInit(): void {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        this.route.navigate(['/login'])
        // ...
      } else {
        this.email = user.email ?? '';
        try {
          const accountInfo = await this.httpService.getAccountData();
          if(this.firstNameElem) {
            this.firstNameElem.nativeElement.value = accountInfo.data.firstName;
          }
          if(this.lastNameElem) {
            this.lastNameElem.nativeElement.value = accountInfo.data.lastName;
          }
          if(this.accountTypeElem) {
            this.accountTypeElem.nativeElement.value = accountInfo.data.type;
          }
          if(this.accountVisibilityElem) {
            this.accountVisibilityElem.nativeElement.value = accountInfo.data.public ? "Public" : "Private";
          }
          this.id = accountInfo.data._id;
        } catch(ignored) {

        }
      }
    });
  }

  async submitForm() {
    if(this.id === undefined) {
      return;
    }
    await this.httpService.setAccountData(this.id, {
      firstName: this.firstNameElem?.nativeElement.value,
      lastName: this.lastNameElem?.nativeElement.value,
      public: this.accountVisibilityElem?.nativeElement.value === "Public",
      type: this.accountTypeElem?.nativeElement.value,
    })
  }

}
