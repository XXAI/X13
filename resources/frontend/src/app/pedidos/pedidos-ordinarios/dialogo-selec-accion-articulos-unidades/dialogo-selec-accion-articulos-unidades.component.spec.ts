import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoSelecAccionArticulosUnidadesComponent } from './dialogo-selec-accion-articulos-unidades.component';

describe('DialogoSelecAccionArticulosUnidadesComponent', () => {
  let component: DialogoSelecAccionArticulosUnidadesComponent;
  let fixture: ComponentFixture<DialogoSelecAccionArticulosUnidadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoSelecAccionArticulosUnidadesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoSelecAccionArticulosUnidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
