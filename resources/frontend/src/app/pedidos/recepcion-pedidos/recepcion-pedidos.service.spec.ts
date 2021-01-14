import { TestBed } from '@angular/core/testing';

import { RecepcionPedidosService } from './recepcion-pedidos.service';

describe('RecepcionPedidosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RecepcionPedidosService = TestBed.get(RecepcionPedidosService);
    expect(service).toBeTruthy();
  });
});
