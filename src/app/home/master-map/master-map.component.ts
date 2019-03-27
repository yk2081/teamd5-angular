import { Component, OnInit, ElementRef, ViewChild, Input, OnChanges, ViewEncapsulation } from '@angular/core';
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

  private data_userCountByCounty$;
  private data_userCountByCounty;

  constructor(private backend: BackendService) {

  }

  ngOnInit() {
    this.refresh("users");
  }

/*
  ngOnChanges(): void {
    if (!this.data) { return; }

    this.refresh();
  }
*/
  private refresh(tablename) {

    d3.select('svg').remove();

    this.data_userCountByCounty$ = this.backend.getUserCountByCounty(tablename);

    let root = this;
    Promise.all([
      this.load_county(),
      this.data_userCountByCounty$.toPromise()]).then(function(values) {
        root.us_data = values[0];
        root.data_userCountByCounty = values[1];

        root.draw_map();
    })
  }

  private load_county() {
    return d3.json('assets/us.json');
  }

  private draw_map() {
    const root = this;
    const element = this.chartContainer.nativeElement;

    const svg = d3.select(element).append("svg")
      .attr("width", 1200)
      .attr("height", 800);

    // tooltips
    const tip = d3Tip();
    tip
      .attr('class', 'd3-tip')
      .html(function(d) {
        let userIndex = root.search(d.id, root.data_userCountByCounty, "countyid");
        if (userIndex > 0) {
          let html = `<strong>County : </strong> <span style="color:yellow">` + root.data_userCountByCounty[userIndex].county + "</span><br/>"
          html += `<strong>State : </strong> <span style="color:yellow">` + root.data_userCountByCounty[userIndex].state + "</span><br/>"
          html += `<strong>User Count : </strong> <span style="color:yellow">` + root.data_userCountByCounty[userIndex].total + "</span>"
          return html;
        }
        else {
          return "No user found in this county";
        }

      })
    svg.call(tip);

    // calculate color threshold
    // @ts-ignore
    let max = d3.max(this.data_userCountByCounty, function(d) { return d.total });
    // @ts-ignore
    let chunkSize = Math.ceil(max / 9);
    for( var i = 0; i < this.data_userCountByCounty.length; i++) {
        this.data_userCountByCounty[i].ValueSegment = Math.floor(this.data_userCountByCounty[i].total / chunkSize);
        if (this.data_userCountByCounty[i].ValueSegment > 8)
            this.data_userCountByCounty[i].ValueSegment = 8;
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
        if (userIndex > 0)
          return zScale(root.data_userCountByCounty[userIndex].ValueSegment);
        else
          return "white";
      })
      .attr("d", d3.geoPath())
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    svg.append("path")
        .datum(topojson.mesh(this.us_data, this.us_data.objects.states, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", d3.geoPath());
  }

  // helper function to search by countyid
  private search(key, data, colname) {
      var index = -1;
      for(var i = 0; i < data.length; i ++) {
          if (data[i][colname] == key) {
              index = i;
          }
      }
      return index;
  }

  private user() {
    this.refresh("users");
  }

  private job() {
    this.refresh("jobs");
  }

}
