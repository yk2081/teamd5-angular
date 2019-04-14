import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
declare var $:any;
import * as d3 from 'd3';

@Component({
  selector: 'app-user-modal',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css']
})
export class UserModalComponent implements OnChanges {

  @ViewChild('barchart1')
  private barchart1: ElementRef;
  @ViewChild('barchart2')
  private barchart2: ElementRef;
  @ViewChild('barchart3')
  private barchart3: ElementRef;
  @ViewChild('barchart4')
  private barchart4: ElementRef;

  @Input() userdata;

  private notapplicable = {};
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.userdata.county) {
      $('#userModal').modal('show');
      this.drawBar(this.userdata.degrees, this.barchart1.nativeElement,'degreetype');
      this.drawBar(this.userdata.majors, this.barchart2.nativeElement,'major');
      this.drawBar(this.userdata.currentjobs, this.barchart3.nativeElement,'title');
      this.drawBar(this.userdata.futurejobs, this.barchart4.nativeElement,'title');
    }
  }

  private drawBar(data, svgelement, column) {

    let element = svgelement;
    let svg = d3.select(element);
    svg.html("");

    let gap = 50;
    let padding = 100;
    let w = 500;
    let h = 600;

    svg.attr("width", w)
    .attr("height", h)
    .attr("transform", "translate(" + 0 + ",-60)")

    let xScale = d3.scaleLinear()
     .domain([0, d3.max(data, function(d:any) {
       return parseInt(d.count); })])
     .range([0, 350]);


    // Y Axis
    let yDomain = this.getUnique(data, column);
    let yRange = this.getRange(yDomain, gap, padding);
    let yScale = d3.scaleOrdinal()
     .domain(yDomain)
     .range(yRange);

    svg.append("g")
     .attr("class", "axis")
     .attr("x", "0")
     .attr("transform", "translate(" + 20 + ",-20)")
     .style("text-anchor", "start")
     .call(
       // @ts-ignore
       d3.axisLeft(yScale));

    // Bars
    svg.selectAll(".bar")
     .data(data)
     .enter().append("rect")
     .attr("class", "bar")
     //.attr("id", function(d) { return d.country; })
     .attr("x", 20)
     .attr("y", function(d, i) { return gap * i + padding; })
     .attr("width", function(d:any) {
       return xScale(parseInt(d.count)); })
     .attr("height", 15)
     .attr("fill", "steelblue")

   svg.selectAll(".text-total")
    .data(data)
    .enter().append("text")
    .attr("class", "text-total")
    .attr("x", (380))
    .attr("y", function(d, i) { return gap * i + padding + 13; })
    .text(function(d:any) {
      return (parseInt(d.count)).toLocaleString() + " (" + parseFloat(d.percentage).toLocaleString("en", {style: "percent"}) + ")" })
  }

  private getUnique(data, colname) {
      var values = [];
      data.forEach(function(d, i) {
          if (i == 0) {
              values.push(d[colname]);
          }
          else {
              if (!values.includes(d[colname]))
                  values.push(d[colname]);
          }
      });

      return values;
  }

  private getRange(domain, gap , padding) {
    var temp = [];
    for(var i = 0; i < domain.length; i++) {
        temp.push(gap * i + padding);
    }

    return temp;
}

}
