import { TestBed } from '@angular/core/testing';

import { BienesServiciosService } from './bienes-servicios.service';

describe('BienesServiciosService', () => {
  let service: BienesServiciosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BienesServiciosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
