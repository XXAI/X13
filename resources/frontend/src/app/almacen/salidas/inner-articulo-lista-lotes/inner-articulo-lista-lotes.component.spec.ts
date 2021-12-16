import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InnerArticuloListaLotesComponent } from './inner-articulo-lista-lotes.component';

describe('InnerArticuloListaLotesComponent', () => {
  let component: InnerArticuloListaLotesComponent;
  let fixture: ComponentFixture<InnerArticuloListaLotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InnerArticuloListaLotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InnerArticuloListaLotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
