import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesRecepcionPedidoComponent } from './detalles-recepcion-pedido.component';

describe('DetallesRecepcionPedidoComponent', () => {
  let component: DetallesRecepcionPedidoComponent;
  let fixture: ComponentFixture<DetallesRecepcionPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetallesRecepcionPedidoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesRecepcionPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
