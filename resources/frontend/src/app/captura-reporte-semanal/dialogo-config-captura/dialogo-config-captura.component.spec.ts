import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoConfigCapturaComponent } from './dialogo-config-captura.component';

describe('DialogoConfigCapturaComponent', () => {
  let component: DialogoConfigCapturaComponent;
  let fixture: ComponentFixture<DialogoConfigCapturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoConfigCapturaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoConfigCapturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
