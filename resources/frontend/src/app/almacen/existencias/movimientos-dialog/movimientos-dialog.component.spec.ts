import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MovimientosDialogComponent } from './movimientos-dialog.component';

describe('MovimientosDialogComponent', () => {
  let component: MovimientosDialogComponent;
  let fixture: ComponentFixture<MovimientosDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MovimientosDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovimientosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
