import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoInsumoPedidoComponent } from './dialogo-insumo-pedido.component';

describe('DialogoInsumoPedidoComponent', () => {
  let component: DialogoInsumoPedidoComponent;
  let fixture: ComponentFixture<DialogoInsumoPedidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoInsumoPedidoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoInsumoPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
