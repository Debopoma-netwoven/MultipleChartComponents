import { Component, OnInit, Input, ViewEncapsulation,ViewChild,TemplateRef,Inject } from '@angular/core';
import * as d3 from 'd3';
import { GRAPH_SETTINGS } from '../../neuro-graph.config';
import { BrokerService } from '../../../fire-base/broker.service';
import { allMessages, allHttpMessages, medication } from '../../neuro-graph.config';
//import { BsModalService } from 'ngx-bootstrap/modal';
//import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import * as moment from 'moment';

import {MdDialog,MdDialogRef,MD_DIALOG_DATA} from '@angular/material';

@Component({
  selector: '[app-relapses]',
  templateUrl: './relapses.component.html',
  styleUrls: ['./relapses.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class RelapsesComponent implements OnInit {
  @ViewChild('relapsesSecondLevelTemplate') private relapsesSecondLevelTemplate: TemplateRef<any>;
  @ViewChild('relapsesEditSecondLevelTemplate') private relapsesEditSecondLevelTemplate: TemplateRef<any>;
  
  @Input() private chartState: any;
  private yDomain: Array<number> = [0, GRAPH_SETTINGS.edss.maxValueY];
  private width: number;
  private height: number;
  private yScale: any;
 
  // private months = [
  //   {value: 'Jan', viewValue: 'Jan'},
  //   {value: 'Feb', viewValue: 'Feb'},
  //   {value: 'Mar', viewValue: 'Mar'},
  //   {value: 'Jan', viewValue: 'Apr'},
  //   {value: 'Feb', viewValue: 'May'},
  //   {value: 'Mar', viewValue: 'Jun'},
  //   {value: 'Jan', viewValue: 'Jul'},
  //   {value: 'Feb', viewValue: 'Aug'},
  //   {value: 'Mar', viewValue: 'Sep'},
  //   {value: 'Jan', viewValue: 'Oct'},
  //   {value: 'Feb', viewValue: 'Nov'},
  //   {value: 'Mar', viewValue: 'Dec'}
  // ];

  // private years = [
  //   {value: '2017', viewValue: '2017'},
  //   {value: '2016', viewValue: '2016'},
  //   {value: '2015', viewValue: '2015'},
  //   {value: '2014', viewValue: '2014'},
  //   {value: '2013', viewValue: '2013'},
  //   {value: '2012', viewValue: '2012'},
  //   {value: '2011', viewValue: '2011'},
  //   {value: '2010', viewValue: '2010'},
  //   {value: '2009', viewValue: '2009'},
  //   {value: '2008', viewValue: '2008'},
  //   {value: '2007', viewValue: '2007'},
  //   {value: '2006', viewValue: '2006'}
  // ];
  // private years =  Array.apply(2017, {length: 100}).map(function(value, index){
  //   return index - 1;
    private years = [];//Array().fill(1917,100,2017);//Array.apply(2017, Array(100)).map(function(value, index) { return index - 1; })
  //[2017,1917];
  private months = ['Jan', 'Feb', 'Mar', 'Apr','May', 'Jun', 'Jul', 'Aug','Sep', 'Oct', 'Nov', 'Dec'];
  //private modalRef: BsModalRef;
  private relapsesDetail: any;
  private subscriptions: any;
  private datasetA: Array<any> =[
    {
      "score_id": "1",
      "score": "2.0",
      "last_updated_provider_id": "G00123",
      "last_updated_instant": "08/31/2017 10:41:05",
      "save_csn": "865482572",
      "save_csn_status": "Open",
      "clinician_confirm":"1",
      "relapse_cnt":"2"
    },
    {
      "score_id": "2",
      "score": "2.0",
      "last_updated_provider_id": "G00123",
      "last_updated_instant": "02/21/2017 10:41:05",
      "save_csn": "710119378",
      "save_csn_status": "Closed",
      "clinician_confirm":"0",
      "relapse_cnt":""
    },
    {
      "score_id": "3",
      "score": "2.0",
      "last_updated_provider_id": "G00123",
      "last_updated_instant": "08/12/2016 10:41:05",
      "save_csn": "642945505",
      "save_csn_status": "Open",
      "clinician_confirm":"0",
      "relapse_cnt":"2"
    },
    {
      "score_id": "4",
      "score": "2.0",
      "last_updated_provider_id": "G00123",
      "last_updated_instant": "01/05/2016 10:41:05",
      "save_csn": "584384988",
      "save_csn_status": "Closed",
      "clinician_confirm":"1",
      "relapse_cnt":"1"
    }
  ];
  private relapsesData: Array<any>;
  // constructor(private brokerService: BrokerService, private modalService: BsModalService,public dialog: MdDialog)
  //  {
    
  //   }
    constructor(private brokerService: BrokerService,public dialog: MdDialog)
    {
     
     }
  ngOnInit() {
    for(var i=2017;i>=1917;i--)
    {
      this.years.push(i.toString());
    }
    console.log('relapses ngOnInit');
    this.subscriptions = this
      .brokerService
      .filterOn(allHttpMessages.httpGetEdss)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.relapsesData = d.data.edss_scores;
            //this.createChart();
          })();
      })
    let relapses = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'relapses'));
//debugger;
    let sub1 = relapses
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            console.log(d.data);
            this.createChart();
            //make api call
            this
              .brokerService
              .httpGet(allHttpMessages.httpGetEdss);
          })();
      });
    let sub2 = relapses
      .filter(t => !t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            console.log(d.data);
            this.removeChart();
          })();
      })
    this
      .subscriptions
      .add(sub1)
      .add(sub2);
  }
  removeChart() {
    d3.select('#relapses').selectAll("*").remove();
  }
  
  showSecondLevel(data) {
    console.log(data);
    //debugger;
    let config = { backdrop: false, class: 'otherMedsSecondLevel' };
    this.relapsesDetail = data;
    if(data.save_csn_status =="Open")
    {
      //this.modalRef = this.modalService.show(this.relapsesSecondLevelTemplate)
      let dialogRef = this.dialog.open(this.relapsesSecondLevelTemplate);
    }
   
  else{
  
    let dialogRef = this.dialog.open(this.relapsesEditSecondLevelTemplate,{width:"425px"});
  }
    
  }
  checkChge(obj){
    //debugger;
    if(this.relapsesDetail.confirm ==1)
    {
      this.relapsesDetail.confirm =0;
    }
    else{
      this.relapsesDetail.confirm =1;
    }
  }
  createChart() {
    let dataset = this.relapsesData.map(d => {
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
        confirm: parseInt(d.clinician_confirm),
        month:moment(d.last_updated_instant).format('MMM'),
        year:moment(d.last_updated_instant).format('YYYY'),
        noconfirm: !parseInt(d.clinician_confirm)
       
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
      .attr("d", lineA)
      .attr("stroke","red")
      .attr("stroke-width","1.5")
      .attr("fill","none");

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
      .on('click', d => {
        this.showSecondLevel(d);
      })

  }
}


