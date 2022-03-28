import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoSolicitudRepetidaComponent } from './dialogo-solicitud-repetida.component';

describe('DialogoSolicitudRepetidaComponent', () => {
  let component: DialogoSolicitudRepetidaComponent;
  let fixture: ComponentFixture<DialogoSolicitudRepetidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoSolicitudRepetidaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoSolicitudRepetidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
