import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoHistorialModificacionesComponent } from './dialogo-historial-modificaciones.component';

describe('DialogoHistorialModificacionesComponent', () => {
  let component: DialogoHistorialModificacionesComponent;
  let fixture: ComponentFixture<DialogoHistorialModificacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoHistorialModificacionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoHistorialModificacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
