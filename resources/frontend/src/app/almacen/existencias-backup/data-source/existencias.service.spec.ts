import { TestBed } from '@angular/core/testing';

import { ExistenciasService } from './existencias.service';

describe('ExistenciasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExistenciasService = TestBed.get(ExistenciasService);
    expect(service).toBeTruthy();
  });
});
