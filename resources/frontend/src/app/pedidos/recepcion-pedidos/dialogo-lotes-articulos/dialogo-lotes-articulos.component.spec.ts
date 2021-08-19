import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoLotesArticulosComponent } from './dialogo-lotes-articulos.component';

describe('DialogoLotesArticulosComponent', () => {
  let component: DialogoLotesArticulosComponent;
  let fixture: ComponentFixture<DialogoLotesArticulosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoLotesArticulosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoLotesArticulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
