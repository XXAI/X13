import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarHorarioDialogComponent } from './editar-horario-dialog.component';

describe('EditarHorarioDialogComponent', () => {
  let component: EditarHorarioDialogComponent;
  let fixture: ComponentFixture<EditarHorarioDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarHorarioDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarHorarioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
