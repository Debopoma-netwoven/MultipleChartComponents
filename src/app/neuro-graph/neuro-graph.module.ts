import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import {BrowserModule} from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ModalModule } from 'ngx-bootstrap/modal';
// import {DialogModule, OverlayPanelModule} from 'primeng/primeng';
// import {NgbModule,NgbPopoverConfig} from '@ng-bootstrap/ng-bootstrap';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MdDialogModule } from '@angular/material';
import { GraphPanelComponent } from './graph-panel/graph-panel.component';
import { NeuroRelatedComponent } from './neuro-related/neuro-related.component';
import { PatientConcernsComponent } from './patient-concerns/patient-concerns.component';
import { NeuroGraphBoxComponent } from './neuro-graph-box/neuro-graph-box.component';
import { BrokerService } from '../fire-base/broker.service';
import { NeuroGraphService } from './neuro-graph.service';
import { MedicationsComponent } from './graph-panel/medications/medications.component';
import { CdsComponent } from './cds/cds.component';
import { SharedGridComponent } from './graph-panel/shared-grid/shared-grid.component';
import { EdssComponent } from './graph-panel/edss/edss.component';
import { RelapsesComponent } from './graph-panel/relapses/relapses.component';
//import {DialogComponent}  from './graph-panel/relapses/relapses.component';

export const ROUTES: Routes = [];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forRoot(ROUTES),
    PopoverModule.forRoot(),
    ModalModule.forRoot(),
    BrowserAnimationsModule,
    MdDialogModule
    // ,BrowserAnimationsModule
  ],
  declarations: [
    GraphPanelComponent,
    NeuroRelatedComponent,
    PatientConcernsComponent,
    NeuroGraphBoxComponent,
    MedicationsComponent,
    CdsComponent,
    EdssComponent,
    SharedGridComponent,
    RelapsesComponent
    
  ],
  //entryComponents: [ DialogComponent ],
  exports: [NeuroGraphBoxComponent],
  providers: [BrokerService, NeuroGraphService]
})
export class NeuroGraphModule { }