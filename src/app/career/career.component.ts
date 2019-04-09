import { Component, OnInit } from '@angular/core';
import {BackendService} from '../services/backend.service';
import Swal from 'sweetalert2';

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
    this.showLoading();
    this.backend.$user.subscribe(user => this.user = user);

    this.backend.getRecommendations().toPromise().then(response => {
      let k = 50;
      for(let i = 0; k > i; i++) {
        this.results.push(response[i]);
      }
      Swal.close();
    }).catch(err => {
      console.log(err);
    })
  }

  private showLoading(this) {
    let timeInterval;
    Swal.fire({
      title: "Waiting",
      html: "<div id='swal-timer'>0 second passed...</div><div id='swal-content'>The Oracle has awakened...</div>",
      timer: 60000,
      onBeforeOpen: () => {
        Swal.showLoading();

        timeInterval = setInterval(() => {
          let seconds = Math.floor(((Swal.getTimerLeft() / 1000) - 60) * -1) ;
          Swal.getContent().querySelector("#swal-timer").textContent = seconds + " seconds passed...";

          if (seconds == 5)
            Swal.getContent().querySelector("#swal-content").textContent = "The Oracle is looking at your future...";

          if (seconds == 10)
            Swal.getContent().querySelector("#swal-content").textContent = "The Oracle is working really hard...";

          if (seconds == 20)
            Swal.getContent().querySelector("#swal-content").textContent = "The Oracle is tired...";

          if (seconds == 30)
            Swal.getContent().querySelector("#swal-content").textContent = "I think there is something wrong...Please refresh the page";

        }, 1000)
      },
      onClose: () => {
        clearInterval(timeInterval);
      }
    })
  }

}
