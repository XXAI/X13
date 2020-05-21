import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppHubComponent } from './app-hub.component';

describe('AppHubComponent', () => {
  let component: AppHubComponent;
  let fixture: ComponentFixture<AppHubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppHubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
