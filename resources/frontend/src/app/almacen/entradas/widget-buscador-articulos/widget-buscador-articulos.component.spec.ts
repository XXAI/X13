import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetBuscadorArticulosComponent } from './widget-buscador-articulos.component';

describe('WidgetBuscadorArticulosComponent', () => {
  let component: WidgetBuscadorArticulosComponent;
  let fixture: ComponentFixture<WidgetBuscadorArticulosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WidgetBuscadorArticulosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetBuscadorArticulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
