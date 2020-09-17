import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoSeleccionarUnidadesMedicasComponent } from './dialogo-seleccionar-unidades-medicas.component';

describe('DialogoSeleccionarUnidadesMedicasComponent', () => {
  let component: DialogoSeleccionarUnidadesMedicasComponent;
  let fixture: ComponentFixture<DialogoSeleccionarUnidadesMedicasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoSeleccionarUnidadesMedicasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoSeleccionarUnidadesMedicasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
