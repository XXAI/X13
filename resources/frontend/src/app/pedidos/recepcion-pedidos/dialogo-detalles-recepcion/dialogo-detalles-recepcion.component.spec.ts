import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoDetallesRecepcionComponent } from './dialogo-detalles-recepcion.component';

describe('DialogoDetallesRecepcionComponent', () => {
  let component: DialogoDetallesRecepcionComponent;
  let fixture: ComponentFixture<DialogoDetallesRecepcionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoDetallesRecepcionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoDetallesRecepcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
