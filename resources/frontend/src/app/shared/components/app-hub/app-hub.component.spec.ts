import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppHubComponent } from './app-hub.component';

describe('AppHubComponent', () => {
  let component: AppHubComponent;
  let fixture: ComponentFixture<AppHubComponent>;

  beforeEach(waitForAsync(() => {
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
