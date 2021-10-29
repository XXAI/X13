import { TestBed } from '@angular/core/testing';

import { CatalogoArticulosService } from './catalogo-articulos.service';

describe('CatalogoArticulosService', () => {
  let service: CatalogoArticulosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogoArticulosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
