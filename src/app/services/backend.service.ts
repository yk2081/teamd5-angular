import { Injectable } from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs';
import {HttpClient} from'@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  private url_query = "https://869p2uscle.execute-api.us-east-1.amazonaws.com/staging";
  private url_recommend = "http://teamd5-project-env.h8caqgumtp.us-east-1.elasticbeanstalk.com/api/job/recommendation";
  private user:any = new BehaviorSubject({
    name: '',
    major: '',
    managed_others: '',
    experience_in_years:0,
    k: 50
  });
  public $user = this.user.asObservable();

  constructor(private http: HttpClient) {

  }

  public updateUser(user) {
    this.user.next(user);
  }

  public getUserCountByCounty(this, tablename) {
    console.log(tablename);
    let query = JSON.stringify({
    	"text":
      `SELECT counties.state, counties.county, total, table1.countyid
      FROM
      (SELECT countyid, COUNT(countyid) AS total
      FROM ` + tablename + `
      GROUP BY countyid) AS table1
      LEFT JOIN counties
      ON table1.countyid = counties.id`,
      // `SELECT countyid, COUNT(countyid) AS total
      // FROM users
      // GROUP BY countyid`,
      // `SELECT id AS countyid
      // FROM counties`,
    	"values": []
    });
    return this.http.post(this.url_query, query);
  }

  public getRecommendations(this) {
    let query = JSON.stringify({
      "name": "name"
    });
    return this.http.post(this.url_recommend, query);
  }
}
