import { Component, OnInit } from '@angular/core';
import {BackendService} from '../services/backend.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
        name: 'Liam Charlotte',
        major_input: 'Computer Science',
        degree_type_input: "Bachelors",
        managed_others_input: 'Yes',
        years_exp_input:10,
        k: 50
      }
    } else if (id == 2) {
      this.user = {
        name: 'Abigail Matthews',
        major_input: 'Accounting',
        degree_type_input: "High School",
        managed_others_input: 'No',
        years_exp_input:3,
        k: 50
      }
    } else {
      this.user = {
        name: 'Victoria Jackson',
        major_input: 'Mathematics',
        degree_type_input: "Masters",
        managed_others_input: 'Yes',
        years_exp_input:20,
        k: 50
      }
    }
  }

  private checkProfile() {
    this.backend.updateUser(this.user);
    if (!this.backend.checkProfile()) {
      Swal.fire({
        title: 'Field Missing!',
        text: 'Please enter all fields in User Profile page to continue',
        type: 'error',
        confirmButtonText: 'Cool'
      });
    } else {
      this.router.navigate(["career"]);
    }
  }

}
