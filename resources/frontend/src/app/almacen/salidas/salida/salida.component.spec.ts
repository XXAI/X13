import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SalidaComponent } from './salida.component';

describe('SalidaComponent', () => {
  let component: SalidaComponent;
  let fixture: ComponentFixture<SalidaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SalidaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
