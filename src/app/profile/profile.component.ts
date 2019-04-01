import { Component, OnInit } from '@angular/core';
import {BackendService} from '../services/backend.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private user;

  constructor(private backend: BackendService,
    private router: Router) {

  }

  ngOnInit() {
    this.backend.$user.subscribe(user => this.user = user);
  }

  private updateUser() {
    this.backend.updateUser(this.user);
    this.router.navigate(["career"]);
  }

}
