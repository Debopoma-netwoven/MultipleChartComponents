import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { GRAPH_SETTINGS } from '../../neuro-graph.config';
import { BrokerService } from '../../../fire-base/broker.service';
import { allMessages, allHttpMessages, medication } from '../../neuro-graph.config';

@Component({
  selector: '[app-relapses]',
  templateUrl: './relapses.component.html',
  styleUrls: ['./relapses.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RelapsesComponent implements OnInit {
  @Input() private chartState: any;
  private yDomain: Array<number> = [0, GRAPH_SETTINGS.edss.maxValueY];
  private width: number;
  private height: number;
  private yScale: any;
  private edssScoreDetail: any;
  private subscriptions: any;
  private datasetA: Array<any> =[
    {
      "score_id": "1",
      "score": "2.0",
      "last_updated_provider_id": "G00123",
      "last_updated_instant": "08/31/2017 10:41:05",
      "save_csn": "865482572",
      "save_csn_status": "Open",
      "clinician_confirm":"1"
    },
    {
      "score_id": "2",
      "score": "2.0",
      "last_updated_provider_id": "G00123",
      "last_updated_instant": "02/21/2017 10:41:05",
      "save_csn": "710119378",
      "save_csn_status": "Closed",
      "clinician_confirm":"0"
    },
    {
      "score_id": "3",
      "score": "2.0",
      "last_updated_provider_id": "G00123",
      "last_updated_instant": "08/12/2016 10:41:05",
      "save_csn": "642945505",
      "save_csn_status": "Open",
      "clinician_confirm":"0"
    },
    {
      "score_id": "4",
      "score": "2.0",
      "last_updated_provider_id": "G00123",
      "last_updated_instant": "01/05/2016 10:41:05",
      "save_csn": "584384988",
      "save_csn_status": "Closed",
      "clinician_confirm":"1"
    }
  ];
  private edssData: Array<any>;
  constructor(private brokerService: BrokerService) { }

  ngOnInit() {
    
    console.log('edss ngOnInit');
    this.subscriptions = this
      .brokerService
      .filterOn(allHttpMessages.httpGetEdss)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.edssData = d.data.edss_scores;
            this.createChart();
          })();
      })
    let edss = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'edss'));

    let sub1 = edss
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            console.log(d.data);
            //make api call
            this
              .brokerService
              .httpGet(allHttpMessages.httpGetEdss);
          })();
      });
    let sub2 = edss
      .filter(t => !t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            console.log(d.data);
            //this.removeChart();
          })();
      })
    this
      .subscriptions
      .add(sub1)
      .add(sub2);
  }
  createChart() {
    let dataset = this.edssData.map(d => {
      return {
        ...d,
        lastUpdatedDate: Date.parse(d.last_updated_instant),
        scoreValue: parseFloat(d.score)
      }
    }).sort((a, b) => a.lastUpdatedDate - b.lastUpdatedDate);

    let datasetB = this.datasetA.map(d => {
      return {
        ...d,
        lastUpdatedDate: Date.parse(d.last_updated_instant),
        scoreValue: parseFloat(d.score),
        confirm: parseInt(d.clinician_confirm)
      }
    }).sort((a, b) => a.lastUpdatedDate - b.lastUpdatedDate);

    let element = d3.select("#relapses");
    this.width = GRAPH_SETTINGS.panel.offsetWidth - GRAPH_SETTINGS.panel.marginLeft - GRAPH_SETTINGS.panel.marginRight;
    this.height = GRAPH_SETTINGS.panel.offsetHeight - GRAPH_SETTINGS.panel.marginTop - GRAPH_SETTINGS.panel.marginBottom;

    this.yScale = d3
    .scaleLinear()
    .domain(this.yDomain)
    .range([GRAPH_SETTINGS.edss.chartHeight - 20, 0]);

    let lineA = d3.line<any>()
      .x((d: any) => this.chartState.xScale(d.lastUpdatedDate))
      .y((d: any) => this.yScale(d.scoreValue));
      
     

    let svg = d3.select("#relapses").append("svg")
      .attr("width", element.offsetWidth)
      .attr("height", element.offsetHeight)
      .append("g")
      .attr("transform", "translate(" + GRAPH_SETTINGS.panel.marginLeft + "," + GRAPH_SETTINGS.panel.marginTop + ")");

    svg.append("path")
      .datum([
        { "lastUpdatedDate": this.chartState.xDomain.defaultMinValue, "scoreValue": 2.0 },
        { "lastUpdatedDate": this.chartState.xDomain.defaultMaxValue, "scoreValue": 2.0 }
      ])
      .attr("class", "lineA")
      .attr("d", lineA);


    let arc = d3.symbol().type(d3.symbolTriangle).size(100);
   svg.selectAll(".dotA")
      .data(datasetB)
      .enter().append('path')
      .attr('d', arc)
     
      .attr('transform', d => {
        return `translate(${(this.chartState.xScale(d.lastUpdatedDate))},${(this.yScale(d.scoreValue))}) rotate(180)`;
      })

      .attr('class', 'x-axis-arrow')
      .style("stroke", "red")
      .style("fill", d => {return d.confirm?'red':'#fff';
        
      })


  }
}
