import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoDetallesArticuloComponent } from './dialogo-detalles-articulo.component';

describe('DialogoDetallesArticuloComponent', () => {
  let component: DialogoDetallesArticuloComponent;
  let fixture: ComponentFixture<DialogoDetallesArticuloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoDetallesArticuloComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoDetallesArticuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
