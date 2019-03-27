import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from'@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  private url = "https://869p2uscle.execute-api.us-east-1.amazonaws.com/staging";

  constructor(private http: HttpClient) {

  }

  public getUserCountByCounty(this, tablename) {
    console.log(tablename);
    let query = JSON.stringify({
    	"text":
      `SELECT counties.state, counties.county, total, table1.countyid
      FROM
      (SELECT countyid, COUNT(countyid) AS total
      FROM jobs
      GROUP BY countyid) AS table1
      LEFT JOIN counties
      ON table1.countyid = counties.id`,
    	"values": []
    });
    return this.http.post(this.url, query);
  }
}
