import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoRegistroComponent } from './dialogo-registro.component';

describe('DialogoRegistroComponent', () => {
  let component: DialogoRegistroComponent;
  let fixture: ComponentFixture<DialogoRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoRegistroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
