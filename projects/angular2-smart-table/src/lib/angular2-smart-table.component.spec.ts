import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Angular2SmartTableComponent} from './angular2-smart-table.component';

describe('Angular2SmartTableComponent', () => {
  let component: Angular2SmartTableComponent;
  let fixture: ComponentFixture<Angular2SmartTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Angular2SmartTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Angular2SmartTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
