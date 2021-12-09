import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetBuscadorStockComponent } from './widget-buscador-stock.component';

describe('WidgetBuscadorStockComponent', () => {
  let component: WidgetBuscadorStockComponent;
  let fixture: ComponentFixture<WidgetBuscadorStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WidgetBuscadorStockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetBuscadorStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
