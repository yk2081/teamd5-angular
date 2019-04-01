import { Component, OnInit } from '@angular/core';
import {BackendService} from '../services/backend.service';

@Component({
  selector: 'app-career',
  templateUrl: './career.component.html',
  styleUrls: ['./career.component.css']
})
export class CareerComponent implements OnInit {

  private user;

  constructor(private backend: BackendService) { }

  ngOnInit() {
    this.backend.$user.subscribe(user => this.user = user);

    this.backend.getRecommendations().toPromise().then(response => {
      console.log(response);
    }).catch(err => {
      console.log(err);
    })
  }

}
