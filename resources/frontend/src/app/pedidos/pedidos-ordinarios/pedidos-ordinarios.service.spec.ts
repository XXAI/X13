import { TestBed } from '@angular/core/testing';

import { PedidosOrdinariosService } from './pedidos-ordinarios.service';

describe('PedidosOrdinariosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PedidosOrdinariosService = TestBed.get(PedidosOrdinariosService);
    expect(service).toBeTruthy();
  });
});
