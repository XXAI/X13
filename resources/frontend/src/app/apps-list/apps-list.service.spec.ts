import { TestBed } from '@angular/core/testing';

import { AppsListService } from './apps-list.service';

describe('AppsListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppsListService = TestBed.get(AppsListService);
    expect(service).toBeTruthy();
  });
});
