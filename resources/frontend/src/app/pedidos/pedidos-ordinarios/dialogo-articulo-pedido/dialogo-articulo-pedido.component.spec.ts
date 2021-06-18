import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoArticuloPedidoComponent } from './dialogo-articulo-pedido.component';

describe('DialogoArticuloPedidoComponent', () => {
  let component: DialogoArticuloPedidoComponent;
  let fixture: ComponentFixture<DialogoArticuloPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoArticuloPedidoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoArticuloPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
