import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadMedicaComponent } from './unidad-medica.component';

describe('UnidadMedicaComponent', () => {
  let component: UnidadMedicaComponent;
  let fixture: ComponentFixture<UnidadMedicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnidadMedicaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnidadMedicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
