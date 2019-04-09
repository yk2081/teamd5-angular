import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {BackendService} from '../services/backend.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  private user;

  constructor(private backend: BackendService,
    private router:Router) { }

  ngOnInit() {
    this.backend.$user.subscribe(user => this.user = user);
  }

  private checkProfile() {
    if (!this.backend.checkProfile()) {
      Swal.fire({
        title: 'Field Missing!',
        text: 'Please enter all fields in User Profile page to continue',
        type: 'error',
        confirmButtonText: 'Cool'
      });
      this.router.navigate(["profile"]);
    } else {
      this.router.navigate(["career"]);
    }
  }

}
