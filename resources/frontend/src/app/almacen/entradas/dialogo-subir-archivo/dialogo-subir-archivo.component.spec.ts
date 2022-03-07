import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoSubirArchivoComponent } from './dialogo-subir-archivo.component';

describe('DialogoSubirArchivoComponent', () => {
  let component: DialogoSubirArchivoComponent;
  let fixture: ComponentFixture<DialogoSubirArchivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoSubirArchivoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoSubirArchivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
