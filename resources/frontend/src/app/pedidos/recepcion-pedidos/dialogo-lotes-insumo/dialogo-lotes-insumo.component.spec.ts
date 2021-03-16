import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DialogoLotesInsumoComponent } from './dialogo-lotes-insumo.component';

describe('DialogoLotesInsumoComponent', () => {
  let component: DialogoLotesInsumoComponent;
  let fixture: ComponentFixture<DialogoLotesInsumoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoLotesInsumoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoLotesInsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
