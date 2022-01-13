import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoDetallesStockComponent } from './dialogo-detalles-stock.component';

describe('DialogoDetallesStockComponent', () => {
  let component: DialogoDetallesStockComponent;
  let fixture: ComponentFixture<DialogoDetallesStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoDetallesStockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoDetallesStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
