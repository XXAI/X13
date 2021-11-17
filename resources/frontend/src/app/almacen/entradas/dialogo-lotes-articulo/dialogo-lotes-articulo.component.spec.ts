import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoLotesArticuloComponent } from './dialogo-lotes-articulo.component';

describe('DialogoLotesArticuloComponent', () => {
  let component: DialogoLotesArticuloComponent;
  let fixture: ComponentFixture<DialogoLotesArticuloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoLotesArticuloComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoLotesArticuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
