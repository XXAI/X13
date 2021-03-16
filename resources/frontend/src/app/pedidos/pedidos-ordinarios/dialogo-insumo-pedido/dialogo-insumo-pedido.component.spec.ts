import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DialogoInsumoPedidoComponent } from './dialogo-insumo-pedido.component';

describe('DialogoInsumoPedidoComponent', () => {
  let component: DialogoInsumoPedidoComponent;
  let fixture: ComponentFixture<DialogoInsumoPedidoComponent>;

  beforeEach(waitForAsync(() => {
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
