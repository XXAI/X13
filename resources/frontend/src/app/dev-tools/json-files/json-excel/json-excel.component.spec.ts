import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonExcelComponent } from './json-excel.component';

describe('JsonExcelComponent', () => {
  let component: JsonExcelComponent;
  let fixture: ComponentFixture<JsonExcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JsonExcelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JsonExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
