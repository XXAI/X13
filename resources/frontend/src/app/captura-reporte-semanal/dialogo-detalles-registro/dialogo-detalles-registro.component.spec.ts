import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoDetallesRegistroComponent } from './dialogo-detalles-registro.component';

describe('DialogoDetallesRegistroComponent', () => {
  let component: DialogoDetallesRegistroComponent;
  let fixture: ComponentFixture<DialogoDetallesRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoDetallesRegistroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoDetallesRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
