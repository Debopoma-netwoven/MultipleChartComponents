import { Component, OnInit, Input, ViewEncapsulation, TemplateRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { BrokerService } from '../../../fire-base/broker.service';
import { allMessages, allHttpMessages, medication } from '../../neuro-graph.config';
import { searchObject } from '../../neuro-graph.helper';
import { GRAPH_SETTINGS } from '../../neuro-graph.config';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

@Component({
  selector: '[app-medications]',
  templateUrl: './medications.component.html',
  styleUrls: ['./medications.component.sass']
})
export class MedicationsComponent implements OnInit {
  @ViewChild('dmtSecondLevelTemplate') private dmtSecondLevelTemplate: TemplateRef<any>;
  @ViewChild('vitaminDSecondLevelTemplate') private vitaminDSecondLevelTemplate: TemplateRef<any>;
  @ViewChild('otherMedsSecondLevelTemplate') private otherMedsSecondLevelTemplate: TemplateRef<any>;
  @Input() private chartState: any;

  medicationDetail: any;
  modalRef: BsModalRef;
  subscriptions: any;
  dmtArray: Array<any> = [];
  vitaminDArray: Array<any> = [];
  otherMedsArray: Array<any> = [];
  selectedMed: Object = {
    dmt: false,
    otherMeds: false,
    vitaminD: false
  };
  medType = {
    dmt: 'dmt',
    otherMeds: 'otherMeds',
    vitaminD: 'vitaminD'
  };

  constructor(private brokerService: BrokerService, private modalService: BsModalService) { }

  ngOnInit() {
    console.log('medications ngOnInit');
    this.subscriptions = this
      .brokerService
      .filterOn(allHttpMessages.httpGetMedications)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            console.log(d.data);
            this.prepareMedications(d.data);
            if (this.selectedMed[this.medType.dmt]) {
              this.drawDmt();
            }
            if (this.selectedMed[this.medType.vitaminD]) {
              this.drawVitaminD();
            } if (this.selectedMed[this.medType.otherMeds]) {
              this.drawOtherMeds();
            }
          })();
      });
    let neuroRelated = this
      .brokerService
      .filterOn(allMessages.neuroRelated);
    this.processMedication(neuroRelated, this.medType.dmt);
    this.processMedication(neuroRelated, this.medType.vitaminD);
    this.processMedication(neuroRelated, this.medType.otherMeds);
  }

  ngOnDestroy() {
    this
      .subscriptions
      .unsubscribe();
  }

  processMedication(neuroRelated, medication) {
    // A medication was checked 
    let sub1 = neuroRelated.filter(t => {
      return ((t.data.artifact == medication) && (t.data.checked))
    }).subscribe(d => {
      d.error
        ? console.log(d.error)
        : (() => {
          console.log(d.data);
          this.selectedMed[medication] = true;
          this
            .brokerService
            .httpGet(allHttpMessages.httpGetMedications);
        })();
    })
    //A medication was unchecked
    let sub2 = neuroRelated.filter(t => {
      return ((t.data.artifact == medication) && (!t.data.checked));
    }).subscribe(d => {
      d.error
        ? console.log(d.error)
        : (() => {
          console.log(d.data);
          this.selectedMed[medication] = false;
          if (medication == this.medType.dmt) {
            this.removeDmt()
          } else if (medication == this.medType.vitaminD) {
            this.removeVitaminD()
          } else {
            this.removeOtherMeds()
          }
        })();
    });
    this
      .subscriptions
      .add(sub1)
      .add(sub2);
  }

  prepareMedications(data) {
    let medicationOrders: Array<any> = [];
    data && data.EPIC && data.EPIC.patients && (data.EPIC.patients.length > 0) && (medicationOrders = data.EPIC.patients[0].medicationOrders);
    let genericNames = medication.dmt.genericNames.toString().toLowerCase().split(',');
    let vitaminDIds = medication.vitaminD.ids;
    let otherMedsIds = medication.otherMeds.ids;
    let mappedCodes = medication.otherMeds.mappedCodes;
    medicationOrders.forEach(x => {
      if (x.medication && genericNames.includes(x.medication.simple_generic_name.toLowerCase())) {
        x.type = this.medType.dmt //m.medication.id
      } else if (x.medication && vitaminDIds.includes(x.medication.id)) {
        x.type = this.medType.vitaminD
      } else if (x.medication && otherMedsIds.includes(x.medication.id)) {
        x.type = this.medType.otherMeds
      } else if (searchObject(x, 'mapped_code', mappedCodes).length > 0) {
        x.type = this.medType.otherMeds
      }
    });
    this.dmtArray = medicationOrders
      .filter(x => x.type == this.medType.dmt)
      .sort((a, b) => Date.parse(b.date.medStart) - Date.parse(a.date.medStart));
    this.vitaminDArray = medicationOrders
      .filter(x => x.type == this.medType.vitaminD)
      .sort((a, b) => Date.parse(b.date.medStart) - Date.parse(a.date.medStart));;
    this.otherMedsArray = medicationOrders
      .filter(x => x.type == this.medType.otherMeds)
      .sort((a, b) => Date.parse(b.date.medStart) - Date.parse(a.date.medStart));;
  }

  drawDmt() {
    let config = { backdrop: false, class: 'dmtSecondLevel' };
    let openDmtModal = (data) => {
      this.medicationDetail = data;
      this.modalRef = this.modalService.show(this.dmtSecondLevelTemplate, config)
    };
    this.drawChart(this.dmtArray, this.medType.dmt, GRAPH_SETTINGS.medications.dmtColor, openDmtModal);
  }

  drawVitaminD() {
    let config = { backdrop: false, class: 'vitaminDSecondLevel' };
    let openVitaminDModal = (data) => {
      this.medicationDetail = data;
      this.modalRef = this.modalService.show(this.vitaminDSecondLevelTemplate)
    };
    this.drawChart(this.vitaminDArray, this.medType.vitaminD, GRAPH_SETTINGS.medications.vitaminDColor, openVitaminDModal);
  }

  drawOtherMeds() {
    let config = { backdrop: false, class: 'otherMedsSecondLevel' };
    let openOtherMedsModal = (data) => {
      this.medicationDetail = data;
      this.modalRef = this.modalService.show(this.otherMedsSecondLevelTemplate)
    };
    this.drawChart(this.otherMedsArray, this.medType.otherMeds, GRAPH_SETTINGS.medications.otherMedsColor, openOtherMedsModal);
  }

  removeDmt() {
    //do other DMT specific task
    this.removeChart(this.medType.dmt);
  }

  removeVitaminD() {
    //do other VitaminD specific task
    this.removeChart(this.medType.vitaminD);
  }

  removeOtherMeds() {
    //do other OtherMeds specific task
    this.removeChart(this.medType.otherMeds);
  }

  getEndDate(input) {
    if (input)
      return Date.parse(input)
    return this.chartState.xDomain.defaultMaxValue;
  }

  getShortenedName(input) {
    let parts = input && input.split(' ');
    let capitalize = parts[0]
      .toLowerCase()
      .replace(/\b(\w)/g, s => s.toUpperCase())
    return capitalize + ' ...';
  }

  drawChart(dataset: Array<any>, containterId, barColor, onClickCallback) {
    //temporary fix to avoid overwrite
    d3.selectAll('#' + containterId).selectAll("*").remove();

    let svg = d3
      .select('#' + containterId)
      .attr('class', containterId + '-elements-wrapper')
      .attr('transform', 'translate(' + GRAPH_SETTINGS.panel.marginLeft + ', 5)');

    //group on generic name
    let groupsUnfiltered = dataset.map(d => d.medication.id);
    let groups = groupsUnfiltered.filter((elem, pos, arr) => arr.indexOf(elem) == pos);

    let rectangles = svg.append('g')
      .selectAll('rect')
      .data(dataset)
      .enter();

    //Draws rectangles
    rectangles.append('rect')
      .attr('rx', 0)
      .attr('ry', 0)
      .attr('x', d => {
        let medStartDate = Date.parse(d.date.medStart || d.date.orderDate);
        let pos = this.chartState.xScale(medStartDate);
        return pos < 0 ? 0 : pos;
      })
      .attr('y', function (d: any, i) {
        for (var j = 0; j < groups.length; j++) {
          if (d.medication.id == groups[j]) {
            return j * 27 + 12;
          }
        }
      })
      .attr('width', d => {
        let medStartDate = Date.parse(d.date.medStart || d.date.orderDate);
        let medEndDate = this.getEndDate(d.date.medEnd);
        return this.chartState.xScale(medEndDate) - this.chartState.xScale(medStartDate);
      })
      .attr('height', 6)
      .attr('stroke', 'none')
      .attr('fill', barColor)
      .style('cursor', 'pointer')
      .on("click", d => {
        onClickCallback(d);
      })


    //Draws texts
    rectangles.append('text')
      .text(d => this.getShortenedName(d.name))
      .attr('x', d => {
        let medStartDate = Date.parse(d.date.medStart || d.date.orderDate);
        let medEndDate = this.getEndDate(d.date.medEnded);
        let width = this.chartState.xScale(medEndDate) - this.chartState.xScale(medStartDate);
        let pos = this.chartState.xScale(medStartDate);
        return pos < 0 ? 0 : pos;
      })
      .attr('y', function (d: any, i) {
        for (var j = 0; j < groups.length; j++) {
          if (d.medication.id == groups[j]) {
            return j * 27 + 8;
          }
        }
      })
      .attr('font-size', 11)
      .attr('text-anchor', 'start')
      .attr('text-height', 40)
      .attr('fill', 'black')
      .style('text-transform', 'capitalize');

    //Adjusts height
    d3.select('#' + containterId).attr('height', groups.length * 30);
    d3.select('#' + containterId).style('display', 'block');
  }

  removeChart(containterId) {
    d3.selectAll('#' + containterId).selectAll("*").remove();
    d3.select('#' + containterId).style('display', 'none');
  }

}
