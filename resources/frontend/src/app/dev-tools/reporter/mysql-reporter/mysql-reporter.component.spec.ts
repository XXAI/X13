import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MysqlReporterComponent } from './mysql-reporter.component';

describe('MysqlReporterComponent', () => {
  let component: MysqlReporterComponent;
  let fixture: ComponentFixture<MysqlReporterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MysqlReporterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MysqlReporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
