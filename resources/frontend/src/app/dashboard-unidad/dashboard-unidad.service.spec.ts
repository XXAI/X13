import { TestBed } from '@angular/core/testing';

import { DashboardUnidadService } from './dashboard-unidad.service';

describe('DashboardUnidadService', () => {
  let service: DashboardUnidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardUnidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
