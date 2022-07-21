import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoResolverConflictoComponent } from './dialogo-resolver-conflicto.component';

describe('DialogoResolverConflictoComponent', () => {
  let component: DialogoResolverConflictoComponent;
  let fixture: ComponentFixture<DialogoResolverConflictoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoResolverConflictoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoResolverConflictoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
