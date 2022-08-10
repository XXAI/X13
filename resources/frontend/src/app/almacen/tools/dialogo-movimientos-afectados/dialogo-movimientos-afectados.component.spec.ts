import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoMovimientosAfectadosComponent } from './dialogo-movimientos-afectados.component';

describe('DialogoMovimientosAfectadosComponent', () => {
  let component: DialogoMovimientosAfectadosComponent;
  let fixture: ComponentFixture<DialogoMovimientosAfectadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoMovimientosAfectadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoMovimientosAfectadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
