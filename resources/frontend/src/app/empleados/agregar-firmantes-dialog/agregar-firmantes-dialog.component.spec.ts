import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarFirmantesDialogComponent } from './agregar-firmantes-dialog.component';

describe('AgregarFirmantesDialogComponent', () => {
  let component: AgregarFirmantesDialogComponent;
  let fixture: ComponentFixture<AgregarFirmantesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgregarFirmantesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarFirmantesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
