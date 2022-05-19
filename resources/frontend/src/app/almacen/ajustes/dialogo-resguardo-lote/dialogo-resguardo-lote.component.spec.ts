import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoResguardoLoteComponent } from './dialogo-resguardo-lote.component';

describe('DialogoResguardoLoteComponent', () => {
  let component: DialogoResguardoLoteComponent;
  let fixture: ComponentFixture<DialogoResguardoLoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoResguardoLoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoResguardoLoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
