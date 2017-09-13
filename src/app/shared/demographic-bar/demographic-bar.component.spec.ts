import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemographicBarComponent } from './demographic-bar.component';

describe('DemographicBarComponent', () => {
  let component: DemographicBarComponent;
  let fixture: ComponentFixture<DemographicBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemographicBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemographicBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
