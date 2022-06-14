import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalAbastoEquipamientoComponent } from './total-abasto-equipamiento.component';

describe('TotalAbastoEquipamientoComponent', () => {
  let component: TotalAbastoEquipamientoComponent;
  let fixture: ComponentFixture<TotalAbastoEquipamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalAbastoEquipamientoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalAbastoEquipamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
