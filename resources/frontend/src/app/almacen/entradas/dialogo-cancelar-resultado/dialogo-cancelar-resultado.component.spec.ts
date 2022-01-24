import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoCancelarResultadoComponent } from './dialogo-cancelar-resultado.component';

describe('DialogoCancelarResultadoComponent', () => {
  let component: DialogoCancelarResultadoComponent;
  let fixture: ComponentFixture<DialogoCancelarResultadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoCancelarResultadoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoCancelarResultadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
