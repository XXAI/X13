import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InsumoLoteDialogoComponent } from './insumo-lote-dialogo.component';

describe('InsumoLoteDialogoComponent', () => {
  let component: InsumoLoteDialogoComponent;
  let fixture: ComponentFixture<InsumoLoteDialogoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InsumoLoteDialogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsumoLoteDialogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
