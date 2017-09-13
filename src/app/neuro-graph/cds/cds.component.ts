import {Component, OnInit,ChangeDetectorRef} from '@angular/core';
import {BrokerService} from '../../fire-base/broker.service';
import {cds, allMessages} from '../neuro-graph.config';

@Component({selector: 'app-cds', templateUrl: './cds.component.html', styleUrls: ['./cds.component.sass']})
export class CdsComponent implements OnInit {
  subscriptions : any;
  cdsState : Object = {};
  constructor(private brokerService : BrokerService, private changeDetector:ChangeDetectorRef) {
    this.cdsState = {
      relapses: {checked:false,info:"Lorem ipsum dolor sit amet, maecenas parturient ac urna sed mi, dui nibh sed orci, convallis ligula ultricies a, mauris risus quisque ornare, malesuada nulla in ut aliquet. Sem consequat fermentum in elit,",title:"Review relapses"},
      imaging: {checked:false,info:"",title:""},
      symptomStatus: {checked:false,info:"",title:""},
      typeStatus: {checked:false,info:"",title:""},
      dmt: {checked:false,info:"",title:""},
      labs: {checked:false,info:"",title:""},
      vitaminD: {checked:false,info:"",title:""},
      otherMeds: {checked:false,info:"",title:""},
      referrals: {checked:false,info:"",title:""},
      vaccinations: {checked:false,info:"",title:""}
    }
  }

  ngOnInit() {
    console.log('cds ngOnInit');
    
    this.subscriptions = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .subscribe(d => {
        let cdsSource = d.data.artifact;
        let cdsTarget : [any] = cds[cdsSource];
        let checked = d.data.checked;
        checked && (cdsTarget && cdsTarget.forEach(x => this.cdsState[x].checked = true));        
        this.changeDetector.detectChanges();
      });
      
  }
  
  // buttonClicked(item) {
  //   this.display=true;
  //   this.header = item;
  // }

  // ngAfterViewInit(){ }

  ngOnDestroy() {
    this
      .subscriptions
      .unsubscribe();
  }

}
