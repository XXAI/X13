import { TestBed } from '@angular/core/testing';

import { ConfiguracionUnidadService } from './configuracion-unidad.service';

describe('ConfiguracionUnidadService', () => {
  let service: ConfiguracionUnidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfiguracionUnidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
