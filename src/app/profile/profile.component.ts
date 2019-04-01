import { Component, OnInit } from '@angular/core';
import {BackendService} from '../services/backend.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private user;

  constructor(private backend: BackendService) {

  }

  ngOnInit() {
    this.backend.$user.subscribe(user => this.user = user);
  }

  private updateUser() {
    this.backend.updateUser(this.user);
  }

}
