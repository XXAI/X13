import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InnerArticuloAdminListaLotesComponent } from './inner-articulo-admin-lista-lotes.component';

describe('InnerArticuloAdminListaLotesComponent', () => {
  let component: InnerArticuloAdminListaLotesComponent;
  let fixture: ComponentFixture<InnerArticuloAdminListaLotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InnerArticuloAdminListaLotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InnerArticuloAdminListaLotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
