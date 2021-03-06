import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConfirmPasswordDialogComponent } from './confirm-password-dialog.component';

describe('ConfirmPasswordDialogComponent', () => {
  let component: ConfirmPasswordDialogComponent;
  let fixture: ComponentFixture<ConfirmPasswordDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmPasswordDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmPasswordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
