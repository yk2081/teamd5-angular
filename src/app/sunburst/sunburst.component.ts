import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Input,
  OnChanges,
  ViewEncapsulation
} from '@angular/core';

import {BackendService} from '../services/backend.service';
import * as d3 from 'd3';
import * as randomColor from 'randomcolor';

declare global {
  interface Window {
    tail: any;
  }
}

@Component({
  selector: 'app-sunburst',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sunburst.component.html',
  styleUrls: ['./sunburst.component.css']
})

export class SunburstComponent implements OnInit {
  @ViewChild('sunburst')

  private chartContainer: ElementRef;
  private data;
  public loading = false;

  margin = { top: 20, right: 20, bottom: 30, left: 40 };
  totalUniqueJobs = 0;
  uniqueJobs = null;
  selectedJob = '.NET PROGRAMMER';
  tailInstance = null;

  // Dimensions of sunburst.
  width = 750;
  height = 600;
  radius = Math.min(this.width - 100, this.height - 100) / 2;

  // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
  b = {
    w: 250,
    h: 40,
    s: 3,
    t: 0
  };

  // Mapping of step names to colors.
  colors = {
    default: '#FFFF'
  };

  // Total size of all segments; we set this later, after loading the data.
  totalSize = 0;
  partition = d3.partition().size([2 * Math.PI, this.radius * this.radius]);
  vis;
  arc;

  constructor(private backend: BackendService) {}

  ngOnInit() {
    // get list of job titles from csv
    this.toggleLoading();

    d3.csv('assets/clean_titles.csv').then(titles => {
      if (titles) {
        const dropDown: any = document.getElementById('jobDropdown');

        titles.forEach((job) => {
          dropDown.options[dropDown.options.length] = new Option(job.title, job.title);
        });
      }

      this.tailInstance = window.tail.select('.select', {
        search: true,
        deselect: true,
      });

      // Setup events for when it changes
      this.tailInstance.on('change', (item, state) => {
        if (state === 'select') {
          this.changeJob(item.value);
        }
      });
      this.toggleLoading();
      this.refresh();
    });
  }

  private changeJob(newJob) {
    this.selectedJob = newJob;
    this.refresh();
  }

  private refresh() {
    // getting Data
    this.toggleLoading();
    this.backend.getPaths(this.selectedJob).toPromise().then(response => {
      if (response) {
        const root = this;
        const jsonResponse = JSON.stringify(response);
        this.data = JSON.parse(jsonResponse);

        // clear out svg container
        d3.select('.svg-container').remove();

        this.vis = d3
          .select('#sunburstChart')
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

        // this is needed because what is passed back looks like a hash table instead of an array
        const jobArray = [];
        const responseLength = Object.keys(this.data).length;

        for (let index = 0; index < responseLength; index++) {
          const jobLine = `${Object.keys(this.data)[index].trim().replace(/,/g, ' ' )}`; // ends here to get a line break
          jobArray.push([jobLine, 1]);
        }

        d3.select('#sequence').style('visibility', 'hidden');

        const jsonHierachy = this.buildHierarchy(jobArray);
        this.createVisualization(jsonHierachy);
        this.toggleLoading();
      } else {
        console.error('No response received');
      }
    });
  }

  // Main function to draw and set up the visualization, once we have the data.
  private createVisualization(json) {
    const that = this;

    // Create colors
    const colorArray = randomColor({ count: this.totalUniqueJobs, luminosity: 'dark' });

    this.uniqueJobs.forEach((job, indx, arr) => {
      that.colors[job] = colorArray[indx];
    });

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

    // this is for the initial view
    const main: any = nodes[1].data;
    this.selectedJob = main.name;
    const statusLine = `<p>Follow the path outward to explore how different people end up as a <br><b>${this.selectedJob}</b>.</p>`;
    d3.select('#explanation').html(statusLine);

    // Add the mouseleave handler to the bounding circle.
    d3.select('#container').on('mouseleave', that.mouseleave.bind(that));

    // Get total size of the tree = value of root node from pa
    this.totalSize = path.datum().value;
  }

  private toggleLoading() {
    this.loading = !this.loading;

    if (this.loading) {
      // hide chart
      d3.select('#sunburstChart').style('visibility', 'hidden');
      d3.select('#sequence').style('visibility', 'hidden');
    } else {
      d3.select('#sunburstChart').style('visibility', 'visible');
    }
  }
  // Fade all but the current sequence, and show it in the breadcrumb trail.
  private mouseover(d) {
    // check if we are at the inner circle
    let percentageString = '';
    let statusLine = '';

    if (d.depth === 1) {
      statusLine = `<p>Follow the path outward to explore how different people end up as a <br><b>${d.data.name}</b>.</p>`;
      d3.select('#explanation').html(statusLine);
      percentageString = '100%';
    } else {
      const percentage = parseFloat(((100 * d.value) / this.totalSize).toPrecision(3));
      percentageString = `${percentage}%`;

      statusLine = `<p>Based on our dataset of <b>${this.uniqueJobs.length}</b> jobs, ${percentageString} of `;
      statusLine += `<b>${d.data.name}</b> become <b>${this.selectedJob}</b> in their next ${d.depth - 1} positions.<p/>`;
    }

    d3.select('#explanation').html(statusLine);

    d3.select('#explanation').style('visibility', 'visable');
    d3.select('#sequence').style('visibility', 'visible');

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

    // Enable this to reset the opacity. I think it looks better without it.
    /*
      // Transition each segment to full opacity and then reactivate it.
      d3.selectAll('path')
        .transition()
        .duration(1000)
        .style('opacity', 1)
        .on('end', () => {
          // d3.select(this).on('mouseover', that.mouseover);
        });
    */
  }

  private initializeBreadcrumbTrail() {
    // Add the svg area.
    const trail = d3
      .select('#sequence')
      .append('svg:svg')
      .attr('width', 250)
      .attr('height', this.width)
      .attr('id', 'trail');

    // Add the label at the end, for the percentage.
    trail
      .append('svg:text')
      .attr('id', 'endlabel')
      .style('fill', '#000');
  }

  // Generate a string that describes the points of a breadcrumb polygon.
  private breadcrumbPoints(d, i) {
    const points = [];
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
    const trail = d3
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
      .attr('x', 10)
      .attr('y', this.b.h / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'right')
      .text((d: any) => {
        return d.data.name;
      });

    // Merge enter and update selections; set position for all nodes.
    entering.merge(trail).attr('transform', (d, i) => {
      return 'translate(10, ' + i * (this.b.h + this.b.s) + ')';
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

  private buildHierarchy(csv) {
    const uniqueJobs = new Set();
    const root = { name: 'root', children: [] };

    // sort to allow proper building of a hierachy
    if (csv.length > 500) {
      csv = csv.slice(0, 500);
    }

    csv = csv.sort((a, b) => {
      // console.log(`${b[0].length} vs ${a[0].length}`);
      if (a[0].length > b[0].length) {
        return -1;
      }

      if (a[0].length < b[0].length) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < csv.length; i++) {
      const sequence = csv[i][0];
      const size = +csv[i][1];

      if (isNaN(size)) {
        // e.g. if this is a header row
        continue;
      }

      const parts = sequence.split('-');
      let currentNode = root;

      for (let j = 0; j < parts.length; j++) {
        let children = currentNode.children;

        if (!children) {
          // TODO: Chekc this out. Some deeper going on
          console.log(`no children hit ${i}  ${j}  ${sequence}`);
          currentNode.children = [];
          children = [];
        }
        // Area to cleanse job titles
        let nodeName = parts[j]
          .toLowerCase()
          .split(' ')
          .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
          .join(' ');

        // Add in job to set
        if (nodeName > 32) {
          nodeName = nodeName.substring(0, 32).trim(); // to match what we put in breadcrujmbs
        }
        uniqueJobs.add(nodeName);

        let childNode;
        if (j + 1 < parts.length) {
          // Not yet at the end of the sequence; move down the tree.
          let foundChild = false;

          // tslint:disable-next-line:prefer-for-of
          for (let k = 0; k < children.length; k++) {
            if (children[k].name === nodeName) {
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
          childNode = { name: nodeName, size };
          children.push(childNode);
        }
      }
    }

    this.totalUniqueJobs = uniqueJobs.size;
    this.uniqueJobs = Array.from(uniqueJobs);

    return root;
  }
}

