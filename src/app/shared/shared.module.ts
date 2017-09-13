import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { DemographicBarComponent } from './demographic-bar/demographic-bar.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [NavBarComponent, DemographicBarComponent],
  exports: [NavBarComponent, DemographicBarComponent]
})
export class SharedModule { }
