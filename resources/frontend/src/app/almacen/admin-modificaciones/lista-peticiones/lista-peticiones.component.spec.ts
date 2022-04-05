import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPeticionesComponent } from './lista-peticiones.component';

describe('ListaPeticionesComponent', () => {
  let component: ListaPeticionesComponent;
  let fixture: ComponentFixture<ListaPeticionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaPeticionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaPeticionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
