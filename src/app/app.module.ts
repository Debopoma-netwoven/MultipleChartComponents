import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {NeuroGraphModule} from './neuro-graph/neuro-graph.module';
import {SharedModule} from './shared/shared.module';

//import {DialogforApp} from './neuro-graph/graph-panel/relapses/relapses.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, NeuroGraphModule, SharedModule, HttpModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}