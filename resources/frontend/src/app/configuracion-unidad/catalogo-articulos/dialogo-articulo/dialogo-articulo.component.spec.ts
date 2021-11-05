import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoArticuloComponent } from './dialogo-articulo.component';

describe('DialogoArticuloComponent', () => {
  let component: DialogoArticuloComponent;
  let fixture: ComponentFixture<DialogoArticuloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoArticuloComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoArticuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
