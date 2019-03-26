import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterMapComponent } from './master-map.component';

describe('MasterMapComponent', () => {
  let component: MasterMapComponent;
  let fixture: ComponentFixture<MasterMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
