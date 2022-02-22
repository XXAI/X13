import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoCancelarMovimientoComponent } from './dialogo-cancelar-movimiento.component';

describe('DialogoCancelarMovimientoComponent', () => {
  let component: DialogoCancelarMovimientoComponent;
  let fixture: ComponentFixture<DialogoCancelarMovimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoCancelarMovimientoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoCancelarMovimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
