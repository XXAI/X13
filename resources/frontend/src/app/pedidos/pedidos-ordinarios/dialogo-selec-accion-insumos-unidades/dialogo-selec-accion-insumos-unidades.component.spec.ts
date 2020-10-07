import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoSelecAccionInsumosUnidadesComponent } from './dialogo-selec-accion-insumos-unidades.component';

describe('DialogoSelecAccionInsumosUnidadesComponent', () => {
  let component: DialogoSelecAccionInsumosUnidadesComponent;
  let fixture: ComponentFixture<DialogoSelecAccionInsumosUnidadesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoSelecAccionInsumosUnidadesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoSelecAccionInsumosUnidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
