import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoFormElementoPedidoComponent } from './dialogo-form-elemento-pedido.component';

describe('DialogoFormElementoPedidoComponent', () => {
  let component: DialogoFormElementoPedidoComponent;
  let fixture: ComponentFixture<DialogoFormElementoPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoFormElementoPedidoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoFormElementoPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
