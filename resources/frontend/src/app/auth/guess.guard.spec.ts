import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { GuessGuard } from './guess.guard';

describe('GuessGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GuessGuard]
    });
  });

  it('should ...', inject([GuessGuard], (guard: GuessGuard) => {
    expect(guard).toBeTruthy();
  }));
});
