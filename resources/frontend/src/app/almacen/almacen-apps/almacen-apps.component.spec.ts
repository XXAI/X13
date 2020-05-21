import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmacenAppsComponent } from './almacen-apps.component';

describe('AlmacenAppsComponent', () => {
  let component: AlmacenAppsComponent;
  let fixture: ComponentFixture<AlmacenAppsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlmacenAppsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlmacenAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
