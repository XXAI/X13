import { TestBed } from '@angular/core/testing';

import { AdminCapturaSemanalService } from './admin-captura-semanal.service';

describe('AdminCapturaSemanalService', () => {
  let service: AdminCapturaSemanalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminCapturaSemanalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
