import { TestBed } from '@angular/core/testing';

import { CatalogosGeneralesService } from './catalogos-generales.service';

describe('CatalogosGeneralesService', () => {
  let service: CatalogosGeneralesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogosGeneralesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
