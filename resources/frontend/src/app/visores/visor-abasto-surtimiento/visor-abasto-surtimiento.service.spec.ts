import { TestBed } from '@angular/core/testing';

import { VisorAbastoSurtimientoService } from './visor-abasto-surtimiento.service';

describe('VisorAbastoSurtimientoService', () => {
  let service: VisorAbastoSurtimientoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisorAbastoSurtimientoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
