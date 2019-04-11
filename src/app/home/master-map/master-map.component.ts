import { Component, OnInit, ElementRef, ViewChild, Input, OnChanges, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import d3Tip from 'd3-tip';
import {BackendService} from '../../services/backend.service';
import {Observable} from 'rxjs';


@Component({
  selector: 'app-master-map',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './master-map.component.html',
  styleUrls: ['./master-map.component.css']
})
export class MasterMapComponent implements OnInit {

  @ViewChild('chart')
  private chartContainer: ElementRef;

  @Input()
  data: any[];

  private us_data:any;
  private mode;

  private data_userCountByCounty$;
  private data_userCountByCounty;
  public loading:boolean = true;

  private userdata = new Object();

  constructor(private backend: BackendService, private cd: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.refresh("users");
    this.mode = "users";
  }

  toggleLoading(mode) {
    this.loading = !this.loading;
    if (mode === "users")
      this.mode = "users";
    else
      this.mode = "jobs";
  }
/*
  ngOnChanges(): void {
    if (!this.data) { return; }

    this.refresh();
  }
*/
  private refresh(tablename) {

    d3.select('.svg-container').remove();

    this.data_userCountByCounty$ = this.backend.getUserCountByCounty(tablename);

    let root = this;
    Promise.all([
      this.load_county(),
      this.data_userCountByCounty$.toPromise()]).then(function(values) {
        root.us_data = values[0];
        root.data_userCountByCounty = values[1];

        root.draw_map();
        root.toggleLoading(root.mode);
    })
  }

  private load_county() {
    return d3.json('assets/us2.json');
  }

  private draw_map() {
    const root = this;
    const element = this.chartContainer.nativeElement;

    // this allows our svg to be responsive instead of hardcoding it.
    const svg = d3.select(element)
      .append("div")
      .classed("svg-container", true)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 1000 800")
      .classed("svg-content-responsive", true);

    // tooltips
    const tip = d3Tip();
    tip
      .attr('class', 'd3-tip')
      .html(function(d) {
        let userIndex = root.search(d.id, root.data_userCountByCounty, "countyid");
        if (userIndex >= 0) {
          let html = `<strong>County : </strong> <span style="color:yellow">` + root.data_userCountByCounty[userIndex].county + "</span><br/>"
          html += `<strong>State : </strong> <span style="color:yellow">` + root.data_userCountByCounty[userIndex].state + "</span><br/>"
          if (root.mode == "users")
            html += `<strong>User Count : </strong> <span style="color:yellow">` + root.data_userCountByCounty[userIndex].total + "</span>"
          else
            html += `<strong>Job Count : </strong> <span style="color:yellow">` + root.data_userCountByCounty[userIndex].total + "</span>"
          return html;
        }
        else {
          return "🤞 We don't have data on this county yet.";
        }

      })
    svg.call(tip);

    // calculate color threshold
    // @ts-ignore
    let max = d3.max(this.data_userCountByCounty, function(d) {
      // @ts-ignore
      return parseInt(d.total) });
    // @ts-ignore
    // let chunkSize = Math.ceil(max / 9);
    // for( var i = 0; i < this.data_userCountByCounty.length; i++) {
    //     this.data_userCountByCounty[i].ValueSegment = Math.floor(this.data_userCountByCounty[i].total / chunkSize);
    // }

    let percentages = [0.0005, 0.001, 0.002, 0.005, 0.01, 0.05, 0.1, 0.5, 1];
    let chunkSizes = [];
    for( let i = 0; i < percentages.length; i++) {
      chunkSizes.push(Math.round(max * percentages[i]));
    }

    for( let i = 0; i < this.data_userCountByCounty.length; i++) {
      if (this.data_userCountByCounty[i].total >= 0 && this.data_userCountByCounty[i] < chunkSizes[0]) this.data_userCountByCounty[i].ValueSegment = 0;
      if (this.data_userCountByCounty[i].total >= chunkSizes[0] && this.data_userCountByCounty[i].total < chunkSizes[1]) this.data_userCountByCounty[i].ValueSegment = 1;
      if (this.data_userCountByCounty[i].total >= chunkSizes[1] && this.data_userCountByCounty[i].total < chunkSizes[2]) this.data_userCountByCounty[i].ValueSegment = 2;
      if (this.data_userCountByCounty[i].total >= chunkSizes[2] && this.data_userCountByCounty[i].total < chunkSizes[3]) this.data_userCountByCounty[i].ValueSegment = 3;
      if (this.data_userCountByCounty[i].total >= chunkSizes[3] && this.data_userCountByCounty[i].total < chunkSizes[4]) this.data_userCountByCounty[i].ValueSegment = 4;
      if (this.data_userCountByCounty[i].total >= chunkSizes[4] && this.data_userCountByCounty[i].total < chunkSizes[5]) this.data_userCountByCounty[i].ValueSegment = 5;
      if (this.data_userCountByCounty[i].total >= chunkSizes[5] && this.data_userCountByCounty[i].total < chunkSizes[6]) this.data_userCountByCounty[i].ValueSegment = 6;
      if (this.data_userCountByCounty[i].total >= chunkSizes[6] && this.data_userCountByCounty[i].total < chunkSizes[7]) this.data_userCountByCounty[i].ValueSegment = 7;
      if (this.data_userCountByCounty[i].total >= chunkSizes[7] && this.data_userCountByCounty[i].total <= chunkSizes[8]) this.data_userCountByCounty[i].ValueSegment = 8;

    }

    let zDomain = [0,1,2,3,4,5,6,7,8];
    let zScale = d3.scaleOrdinal()
    // @ts-ignore
        .domain(zDomain)
        .range(['#fff5eb','#fee6ce','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#a63603','#7f2704']);



    // Map drawing
    svg.selectAll("path")
      .data(topojson.feature(this.us_data, this.us_data.objects.counties).features)
      .enter()
      .append("path")
      .attr("fill", function(d:any) {
        let userIndex = root.search(d.id, root.data_userCountByCounty, "countyid");
        if (userIndex >= 0)
          return zScale(root.data_userCountByCounty[userIndex].ValueSegment);
        else
          return "white";
      })
      .attr("d", d3.geoPath())
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      // @ts-ignore
      .on('click', function(d) {
        // @ts-ignore
        let id = parseInt(d.id);
        Promise.all([root.backend.getUserDegrees(id).toPromise(),
          root.backend.getUserMajors(id).toPromise(),
          root.backend.getUserAverageExperience(id).toPromise(),
          root.backend.getUserUnemployment(id).toPromise()]).then(function(values) {
          root.userdata = new Object();
          // @ts-ignore
          root.userdata.degrees = values[0];
          // @ts-ignore
          root.userdata.majors = values[1];
          // @ts-ignore
          root.userdata.averageexperience = values[2];
          // @ts-ignore
          root.userdata.unemployment = values[3];
          // @ts-ignore
          let userIndex = root.search(d.id, root.data_userCountByCounty, "countyid");
          if (userIndex >= 0) {
            // @ts-ignore
            root.userdata.county = {
              countyid: id,
              county: root.data_userCountByCounty[userIndex].county,
              state: root.data_userCountByCounty[userIndex].state,
            }
          }

          root.cd.detectChanges();
        })
      });

    svg.append("path")
        .datum(topojson.mesh(this.us_data, this.us_data.objects.states, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", d3.geoPath());

    // Legends
    svg.selectAll(".small-tile")
        .data(zDomain)
        .enter().append("rect")
        .attr("class", "small-tile")
        .attr("x", 880)
        .attr("y", function(d) {
          return d * 30 + 300; })
        .attr("width", 40)
        .attr("height", 30)
        .style("fill", function(d) {
          return zScale(d); })

    svg.selectAll(".text-thresh")
        .data(zDomain)
        .enter()
        .append("text")
        .attr("x", 930)
        .attr("y", function(d) { return d * 30 + 335; })
        .text(function(d) { return chunkSizes[d] })
  }

  // helper function to search by countyid
  private search(key, data, colname) {
      var index = -1;
      for(var i = 0; i < data.length; i ++) {
          if (parseInt(data[i][colname]) == parseInt(key)) {
              index = i;
          }
      }
      return index;
  }

  private user() {
    console.debug('inside users');
    this.toggleLoading("users");
    this.refresh("users");
  }

  private job() {
    console.debug('inside jobs');
    this.toggleLoading("jobs");
    this.refresh("jobs");
  }

}
