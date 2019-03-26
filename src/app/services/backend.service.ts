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
      `SELECT \"CountyId\", COUNT(\"CountyId\") AS \"Count\"
      FROM \"` + tablename + `"\
      GROUP BY \"CountyId\"
      ORDER BY \"Count\" DESC`,
    	"values": []
    });
    return this.http.post(this.url, query);
  }
}
