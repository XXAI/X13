import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoModificarMovimientoComponent } from './dialogo-modificar-movimiento.component';

describe('DialogoModificarMovimientoComponent', () => {
  let component: DialogoModificarMovimientoComponent;
  let fixture: ComponentFixture<DialogoModificarMovimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoModificarMovimientoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoModificarMovimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
