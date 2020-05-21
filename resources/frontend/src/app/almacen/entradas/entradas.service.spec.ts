import { TestBed } from '@angular/core/testing';

import { EntradasService } from './entradas.service';

describe('EntradasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EntradasService = TestBed.get(EntradasService);
    expect(service).toBeTruthy();
  });
});
