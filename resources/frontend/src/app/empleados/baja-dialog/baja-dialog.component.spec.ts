import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BajaDialogComponent } from './baja-dialog.component';

describe('BajaDialogComponent', () => {
  let component: BajaDialogComponent;
  let fixture: ComponentFixture<BajaDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BajaDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BajaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
