import { TestBed } from '@angular/core/testing';

import { AdminUsuariosService } from './admin-usuarios.service';

describe('AdminUsuariosService', () => {
  let service: AdminUsuariosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminUsuariosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
