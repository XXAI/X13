import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarTransferenciaDialogComponent } from './confirmar-transferencia-dialog.component';

describe('ConfirmarTransferenciaDialogComponent', () => {
  let component: ConfirmarTransferenciaDialogComponent;
  let fixture: ComponentFixture<ConfirmarTransferenciaDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmarTransferenciaDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmarTransferenciaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
