import { Injectable } from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  private url_query = "https://869p2uscle.execute-api.us-east-1.amazonaws.com/staging";
  private url_recommend = "http://teamd5-project-env.h8caqgumtp.us-east-1.elasticbeanstalk.com/api/job/recommendation";
  private url_jobpath = "http://teamd5-project-env.h8caqgumtp.us-east-1.elasticbeanstalk.com/api/job/path";
  private user:any = new BehaviorSubject({
    name: '',
    major_input: '',
    degree_type_input: "Bachelor's",
    managed_others_input: 'Yes',
    years_exp_input: 2,
    k: 50
  });
  public $user = this.user.asObservable();

  constructor(private http: HttpClient) {}

  public checkProfile(this) {
    console.log(this.user._value);
    if (
        this.user._value.name === ""
        || this.user._value.major_input === ""
        || this.user._value.degree_type_input === ""
        || this.user._value.managed_others_input === "") {
      return false;
    } else {
      return true;
    }
  }

  public updateUser(user) {
    this.user.next(user);
  }

  public getUserCountByCounty(this, tablename) {
    const query = JSON.stringify({
    	text:
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
      values: []
    });
    return this.http.post(this.url_query, query);
  }

  public getUserDegrees(this, countyid) {
    const query = JSON.stringify({
      text:
      `
      select degreetype, count(degreetype) as count
      from users
      where countyid = '` + countyid + `'
      group by degreetype
      order by degreetype
      `,
      values: []
    });
    return this.http.post(this.url_query, query);
  }

  public getUserMajors(this, countyid) {
    const query = JSON.stringify({
      text:
      `
      select major, count(major) as count
      from users
      where countyid = '` + countyid + `'
      group by major
      order by count desc, major
      limit 10;
      `,
      values: []
    });
    return this.http.post(this.url_query, query);
  }

  public getUserAverageExperience(this, countyid) {
    const query = JSON.stringify({
      text:
      `
      select avg(totalyearsinexperience::real) as average
      from users
      where countyid = '` + countyid + `'
      `,
      values: []
    });
    return this.http.post(this.url_query, query);
  }

  public getUserUnemployment(this, countyid) {
    const query = JSON.stringify({
      text:
      `
      select count(id)::real / (select count(id) from users where countyid = '6037') as percentageemployeed
      from users
      where countyid = '` + countyid + `' and currentlyemployeed = 'No'
      `,
      values: []
    });
    return this.http.post(this.url_query, query);
  }

  public getRecommendations(this) {
    const query = JSON.stringify(this.user.value);
    return this.http.post(this.url_recommend, query, {
      dataType: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  public getPaths(this, jobTitle) {
    const query = JSON.stringify({job_title: jobTitle});
    return this.http.post(this.url_jobpath, query, {
      dataType: 'json',
      headers: {
        'Content-Type': 'application/json'
      } // added these options because it is required to avoid 500 server errors.
    });
  }
}
