import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoDetallesComponent } from './dialogo-detalles.component';

describe('DialogoDetallesComponent', () => {
  let component: DialogoDetallesComponent;
  let fixture: ComponentFixture<DialogoDetallesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoDetallesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoDetallesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
