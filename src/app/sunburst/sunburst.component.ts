import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Input,
  OnChanges,
  ViewEncapsulation
} from '@angular/core';

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
  margin = { top: 20, right: 20, bottom: 30, left: 40 };

  // Dimensions of sunburst.
  width = 750;
  height = 600;
  radius = Math.min(this.width, this.height) / 2;

  // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
  b = {
    w: 75,
    h: 30,
    s: 3,
    t: 10
  };

  // Mapping of step names to colors.
  colors = {
    home: '#5687d1',
    product: '#7b615c',
    search: '#de783b',
    account: '#6ab975',
    other: '#a173d1',
    end: '#bbbbbb',
    root: '#bbbbb'
  };

  // Total size of all segments; we set this later, after loading the data.
  totalSize = 0;
  partition = d3.partition().size([2 * Math.PI, this.radius * this.radius]);
  vis;
  arc;

  constructor() {}

  ngOnInit() {
    this.refresh();
  }

  private refresh() {
    const root = this;

    this.vis = d3
      .select('#chart')
      .append('div')
      .classed('svg-container', true)
      .classed('mt-5', true)
      .append('svg:svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '0 0 1000 800')
      .classed('svg-content-responsive', true)
      .append('svg:g')
      .attr('id', 'container')
      .attr(
        'transform',
        'translate(' + this.width / 2 + ',' + this.height / 2 + ')'
      );

    this.arc = d3
      .arc()
      .startAngle((d: any) => {
        return d.x0;
      })
      .endAngle((d: any) => {
        return d.x1;
      })
      .innerRadius((d: any) => {
        return Math.sqrt(d.y0);
      })
      .outerRadius((d: any) => {
        return Math.sqrt(d.y1);
      });

    d3.text('assets/data_sunburst.csv').then(text => {
      const csv = d3.csvParseRows(text);
      const json = this.buildHierarchy(csv);

      this.createVisualization(json);
    });
  }

  // Main function to draw and set up the visualization, once we have the data.
  private createVisualization(json) {
    let that = this;

    // Basic setup of page elements.
    this.initializeBreadcrumbTrail();
    this.drawLegend();

    d3.select('#togglelegend').on('click', this.toggleLegend);

    // Bounding circle underneath the sunburst, to make it easier to detect
    // when the mouse leaves the parent g.
    this.vis
      .append('svg:circle')
      .attr('r', this.radius)
      .style('opacity', 0);

    // Turn the data into a d3 hierarchy and calculate the sums.
    const root = d3
      .hierarchy(json)
      .sum((d) => {
        return d.size;
      })
      .sort((a, b) => {
        return b.value - a.value;
      });

    // For efficiency, filter nodes to keep only those large enough to see.
    const nodes = this.partition(root)
      .descendants()
      .filter((d) => {
        return d.x1 - d.x0 > 0.005;
      });

    const path = this.vis
      .data([json])
      .selectAll('path')
      .data(nodes)
      .enter()
      .append('svg:path')
      .attr('display', (d) => {
        return d.depth ? null : 'none';
      })
      .attr('d', this.arc)
      .attr('fill-rule', 'evenodd')
      .style('fill', (d) => {
        return that.colors[d.data.name];
      })
      .style('opacity', 1)
      .on('mouseover', that.mouseover.bind(that));

    // Add the mouseleave handler to the bounding circle.
    d3.select('#container').on('mouseleave', that.mouseleave.bind(that));

    // Get total size of the tree = value of root node from pa
    this.totalSize = path.datum().value;
  }

  // Fade all but the current sequence, and show it in the breadcrumb trail.
  private mouseover(d) {
    const percentage = parseFloat(((100 * d.value) / this.totalSize).toPrecision(3));
    let percentageString = percentage + '%';

    if (percentage < 0.1) {
      percentageString = '< 0.1%';
    }

    d3.select('#percentage').text(percentageString);
    d3.select('#explanation').style('visibility', '');

    const sequenceArray = d.ancestors().reverse();
    sequenceArray.shift(); // remove root node from the array
    this.updateBreadcrumbs(sequenceArray, percentageString);

    // Fade all the segments.
    d3.selectAll('path').style('opacity', 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    this.vis.selectAll('path')
      .filter((node) => {
        return sequenceArray.indexOf(node) >= 0;
      })
      .style('opacity', 1);
  }

  // Restore everything to full opacity when moving off the visualization.
  private mouseleave(d) {
    const that = this;
    // Hide the breadcrumb trail
    d3.select('#trail').style('visibility', 'hidden');

    // Deactivate all segments during transition.
    // d3.selectAll('path').on('mouseover', null);

    // Transition each segment to full opacity and then reactivate it.
    d3.selectAll('path')
      .transition()
      .duration(1000)
      .style('opacity', 1)
      .on('end', function() {
        // d3.select(this).on('mouseover', that.mouseover);
      });

    d3.select('#explanation').style('visibility', 'hidden');
  }

  private initializeBreadcrumbTrail() {
    // Add the svg area.
    const trail = d3
      .select('#sequence')
      .append('svg:svg')
      .attr('width', this.width)
      .attr('height', 50)
      .attr('id', 'trail');

    // Add the label at the end, for the percentage.
    trail
      .append('svg:text')
      .attr('id', 'endlabel')
      .style('fill', '#000');
  }

  // Generate a string that describes the points of a breadcrumb polygon.
  private breadcrumbPoints(d, i) {
    let points = [];
    points.push('0,0');
    points.push(this.b.w + ',0');
    points.push(this.b.w + this.b.t + ',' + this.b.h / 2);
    points.push(this.b.w + ',' + this.b.h);
    points.push('0,' + this.b.h);

    if (i > 0) {
      // Leftmost breadcrumb; don't include 6th vertex.
      points.push(this.b.t + ',' + this.b.h / 2);
    }

    return points.join(' ');
  }

  // Update the breadcrumb trail to show the current sequence and percentage.
  private updateBreadcrumbs(nodeArray, percentageString) {
    const that = this;
    // Data join; key function combines name and depth (= position in sequence).
    let trail = d3
      .select('#trail')
      .selectAll('g')
      .data(nodeArray, (d: any) => {
        return d.data.name + d.depth;
      });

    // Remove exiting nodes.
    trail.exit().remove();

    // Add breadcrumb and label for entering nodes.
    const entering = trail.enter().append('svg:g');

    entering
      .append('svg:polygon')
      .attr('points', this.breadcrumbPoints.bind(that))
      .style('fill', (d: any) => {
        return that.colors[d.data.name];
      });

    entering
      .append('svg:text')
      .attr('x', (this.b.w + this.b.t) / 2)
      .attr('y', this.b.h / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d: any) => {
        return d.data.name
      });

    // Merge enter and update selections; set position for all nodes.
    entering.merge(trail).attr('transform', (d, i) => {
      return 'translate(' + i * (this.b.w + this.b.s) + ', 0)';
    });

    // Now move and update the percentage at the end.
    d3.select('#trail')
      .select('#endlabel')
      .attr('x', (nodeArray.length + 0.5) * (this.b.w + this.b.s))
      .attr('y', this.b.h / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text(percentageString);

    // Make the breadcrumb trail visible, if it's hidden.
    d3.select('#trail').style('visibility', '');
  }

  private drawLegend() {
    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    const li = {
      w: 75,
      h: 30,
      s: 3,
      r: 3
    };

    const legend = d3
      .select('#legend')
      .append('svg:svg')
      .attr('width', li.w)
      .attr('height', d3.keys(this.colors).length * (li.h + li.s));

    const g = legend
      .selectAll('g')
      .data(d3.entries(this.colors))
      .enter()
      .append('svg:g')
      .attr('transform', (d, i) => {
        return 'translate(0,' + i * (li.h + li.s) + ')';
      });

    g.append('svg:rect')
      .attr('rx', li.r)
      .attr('ry', li.r)
      .attr('width', li.w)
      .attr('height', li.h)
      .style('fill', (d) => {
        return d.value;
      });

    g.append('svg:text')
      .attr('x', li.w / 2)
      .attr('y', li.h / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d) => {
        return d.key;
      });
  }

  private toggleLegend() {
    const legend = d3.select('#legend');

    if (legend.style('visibility') === 'hidden') {
      legend.style('visibility', '');
    } else {
      legend.style('visibility', 'hidden');
    }
  }

  // Take a 2-column CSV and transform it into a hierarchical structure suitable
  // for a partition layout. The first column is a sequence of step names, from
  // root to leaf, separated by hyphens. The second column is a count of how
  // often that sequence occurred.
  private buildHierarchy(csv) {
    const root = { name: 'root', children: [] };

    for (var i = 0; i < csv.length; i++) {
      let sequence = csv[i][0];
      let size = +csv[i][1];

      if (isNaN(size)) {
        // e.g. if this is a header row
        continue;
      }

      let parts = sequence.split('-');
      let currentNode = root;

      for (var j = 0; j < parts.length; j++) {
        let children = currentNode['children'];
        let nodeName = parts[j];
        let childNode;

        if (j + 1 < parts.length) {
          // Not yet at the end of the sequence; move down the tree.
          let foundChild = false;

          for (var k = 0; k < children.length; k++) {
            if (children[k]['name'] == nodeName) {
              childNode = children[k];
              foundChild = true;
              break;
            }
          }

          // If we don't already have a child node for this branch, create it.
          if (!foundChild) {
            childNode = { name: nodeName, children: [] };
            children.push(childNode);
          }

          currentNode = childNode;
        } else {
          // Reached the end of the sequence; create a leaf node.
          childNode = { name: nodeName, size: size };
          children.push(childNode);
        }
      }
    }

    return root;
  }
}
