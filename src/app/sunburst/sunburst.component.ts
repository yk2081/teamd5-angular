import { Component, OnInit, ElementRef, ViewChild, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-sunburst',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sunburst.component.html',
  styleUrls: ['./sunburst.component.css']
})
export class SunburstComponent implements OnInit {

  @ViewChild('sunburst')
  private chartContainer: ElementRef;

  @Input()
  data: any[];

  margin = {top: 20, right: 20, bottom: 30, left: 40};

  constructor() { }

  ngOnInit() {
    this.refresh();
  }

  // Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how
// often that sequence occurred.
  private buildHierarchy(csv) {
    var root = {"name": "root", "children": []};
    for (var i = 0; i < csv.length; i++) {
      var sequence = csv[i][0];
      var size = +csv[i][1];
      if (isNaN(size)) { // e.g. if this is a header row
        continue;
      }
      var parts = sequence.split("-");
      var currentNode = root;
      for (var j = 0; j < parts.length; j++) {
        var children = currentNode["children"];
        var nodeName = parts[j];
        var childNode;
        if (j + 1 < parts.length) {
     // Not yet at the end of the sequence; move down the tree.
   	var foundChild = false;
   	for (var k = 0; k < children.length; k++) {
   	  if (children[k]["name"] == nodeName) {
   	    childNode = children[k];
   	    foundChild = true;
   	    break;
   	  }
   	}
    // If we don't already have a child node for this branch, create it.
   	if (!foundChild) {
   	  childNode = {"name": nodeName, "children": []};
   	  children.push(childNode);
   	}
   	currentNode = childNode;
        } else {
   	// Reached the end of the sequence; create a leaf node.
   	childNode = {"name": nodeName, "size": size};
   	children.push(childNode);
        }
      }
    }
    return root;
  }

  private refresh() {
    var root = this;
    // @ts-ignore
    d3.csv("assets/data_sunburst.csv", function(result) {
      var json = root.buildHierarchy(result);
      root.createSunburst(json);
    });
  }

  private createSunburst(json) {
    // Dimensions of sunburst.
    var width = 750;
    var height = 600;
    var radius = Math.min(width, height) / 2;
    var element = this.chartContainer.nativeElement;
    // Mapping of step names to colors.
    var colors = {
      "home": "#5687d1",
      "product": "#7b615c",
      "search": "#de783b",
      "account": "#6ab975",
      "other": "#a173d1",
      "end": "#bbbbbb"
    };

    // Total size of all segments; we set this later, after loading the data.
    var totalSize = 0;

    var vis = d3.select(element).append("svg:svg")
        .attr("width", width)
        .attr("height", height)
        .append("svg:g")
        .attr("id", "container")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var partition = d3.partition()
        .size([2 * Math.PI, radius * radius]);


    var arc = d3.arc();
    // @ts-ignore
        arc.startAngle(function(d) { return d.x0; })
        // @ts-ignore
        arc.endAngle(function(d) { return d.x1; })
        // @ts-ignore
        arc.innerRadius(function(d) { return Math.sqrt(d.y0); })
        // @ts-ignore
        arc.outerRadius(function(d) { return Math.sqrt(d.y1); });

    // Turn the data into a d3 hierarchy and calculate the sums.
    var root = d3.hierarchy(json)
        .sum(function(d) { return d.size; })
        .sort(function(a, b) { return b.value - a.value; });

    // For efficiency, filter nodes to keep only those large enough to see.
    var nodes = partition(root).descendants()
        .filter(function(d) {
            return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
        });

    var path = vis.data([json]).selectAll("path")
        .data(nodes)
        .enter().append("svg:path")
        .attr("display", function(d) { return d.depth ? null : "none"; });
        // @ts-ignore
        path.attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", function(d) { return colors[d.data.name]; })
        .style("opacity", 1)
  }


}
