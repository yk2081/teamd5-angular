import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Career Recommendation Tool';
  data: Observable<any>;

  constructor(private http: HttpClient) {
    this.data = this.http.get('assets/data.json');
  }
}
