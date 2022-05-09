import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Router } from '@angular/router';
@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {

  constructor(private httpService: HttpService, private route: Router) { }

  ngOnInit(): void {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.route.navigate(['/login'])
        // ...
      }
    });
    this.httpService.getNews().subscribe((data: any) => {
      this.newsList = data.data;
    })
  }

  newsList: {author: "", content: "", description: "", publishedAt: "", source: [], title: "", url: "", urlToImage: ""}[]|undefined;

}

