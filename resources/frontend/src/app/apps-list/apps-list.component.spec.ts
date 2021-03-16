import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppsListComponent } from './apps-list.component';

describe('AppsListComponent', () => {
  let component: AppsListComponent;
  let fixture: ComponentFixture<AppsListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AppsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
