import { TestBed } from '@angular/core/testing';

import { EstatusAvanceRecepcionService } from './estatus-avance-recepcion.service';

describe('EstatusAvanceRecepcionService', () => {
  let service: EstatusAvanceRecepcionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstatusAvanceRecepcionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
