import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoPreviewMovimientoComponent } from './dialogo-preview-movimiento.component';

describe('DialogoPreviewMovimientoComponent', () => {
  let component: DialogoPreviewMovimientoComponent;
  let fixture: ComponentFixture<DialogoPreviewMovimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoPreviewMovimientoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoPreviewMovimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
