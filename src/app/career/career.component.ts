import { Component, OnInit } from '@angular/core';
import {BackendService} from '../services/backend.service';

@Component({
  selector: 'app-career',
  templateUrl: './career.component.html',
  styleUrls: ['./career.component.css']
})
export class CareerComponent implements OnInit {

  private user;
  private results = [];

  constructor(private backend: BackendService) { }

  ngOnInit() {
    this.backend.$user.subscribe(user => this.user = user);

    this.backend.getRecommendations().toPromise().then(response => {
      let k = 50;
      for(let i = 0; k > i; i++) {
        this.results.push(response[i]);
      }
    }).catch(err => {
      console.log(err);
    })
  }

}
