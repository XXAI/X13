import { TestBed } from '@angular/core/testing';

import { MovimientosLocalStorageService } from './movimientos-local-storage.service';

describe('MovimientosLocalStorageService', () => {
  let service: MovimientosLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovimientosLocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
