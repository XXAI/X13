import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoNuevoPedidoComponent } from './dialogo-nuevo-pedido.component';

describe('DialogoNuevoPedidoComponent', () => {
  let component: DialogoNuevoPedidoComponent;
  let fixture: ComponentFixture<DialogoNuevoPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoNuevoPedidoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoNuevoPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
