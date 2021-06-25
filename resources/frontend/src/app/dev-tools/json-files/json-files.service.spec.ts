import { TestBed } from '@angular/core/testing';

import { JsonFilesService } from './json-files.service';

describe('JsonFilesService', () => {
  let service: JsonFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonFilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
