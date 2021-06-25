import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoFormularioGrupoComponent } from './dialogo-formulario-grupo.component';

describe('DialogoFormularioGrupoComponent', () => {
  let component: DialogoFormularioGrupoComponent;
  let fixture: ComponentFixture<DialogoFormularioGrupoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoFormularioGrupoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoFormularioGrupoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
