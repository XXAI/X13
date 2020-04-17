import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudiosDialogComponent } from './estudios-dialog.component';

describe('EstudiosDialogComponent', () => {
  let component: EstudiosDialogComponent;
  let fixture: ComponentFixture<EstudiosDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstudiosDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstudiosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
