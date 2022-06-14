import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosUnidadMedicaComponent } from './datos-unidad-medica.component';

describe('DatosUnidadMedicaComponent', () => {
  let component: DatosUnidadMedicaComponent;
  let fixture: ComponentFixture<DatosUnidadMedicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatosUnidadMedicaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosUnidadMedicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
