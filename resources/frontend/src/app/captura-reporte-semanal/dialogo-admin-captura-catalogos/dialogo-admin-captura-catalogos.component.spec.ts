import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoAdminCapturaCatalogosComponent } from './dialogo-admin-captura-catalogos.component';

describe('DialogoAdminCapturaCatalogosComponent', () => {
  let component: DialogoAdminCapturaCatalogosComponent;
  let fixture: ComponentFixture<DialogoAdminCapturaCatalogosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoAdminCapturaCatalogosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoAdminCapturaCatalogosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
