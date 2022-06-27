import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoModificarStockComponent } from './dialogo-modificar-stock.component';

describe('DialogoModificarStockComponent', () => {
  let component: DialogoModificarStockComponent;
  let fixture: ComponentFixture<DialogoModificarStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoModificarStockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoModificarStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
