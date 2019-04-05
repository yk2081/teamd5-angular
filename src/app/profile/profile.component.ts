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
  // PhD Vocational None Associate's
  private sample(id) {
    if (id == 1) {
      this.user = {
        name: 'Test User1',
        major_input: 'Computer Science',
        degree_type_input: "Bachelor's",
        managed_others_input: 'Yes',
        years_exp_input:10,
        k: 50
      }
    } else if (id == 2) {
      this.user = {
        name: 'Test User2',
        major_input: 'Accounting',
        degree_type_input: "High School",
        managed_others_input: 'No',
        years_exp_input:3,
        k: 50
      }
    } else {
      this.user = {
        name: 'Test User3',
        major_input: 'Mathematics',
        degree_type_input: "Master's",
        managed_others_input: 'Yes',
        years_exp_input:20,
        k: 50
      }
    }
  }

}
