import { TestBed } from '@angular/core/testing';

import { ElementosPedidosService } from './elementos-pedidos.service';

describe('ElementosPedidosService', () => {
  let service: ElementosPedidosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElementosPedidosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
