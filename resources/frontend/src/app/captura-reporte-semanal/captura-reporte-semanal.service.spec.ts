import { TestBed } from '@angular/core/testing';

import { CapturaReporteSemanalService } from './captura-reporte-semanal.service';

describe('CapturaReporteSemanalService', () => {
  let service: CapturaReporteSemanalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapturaReporteSemanalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
