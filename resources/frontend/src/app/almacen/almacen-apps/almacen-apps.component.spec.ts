import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AlmacenAppsComponent } from './almacen-apps.component';

describe('AlmacenAppsComponent', () => {
  let component: AlmacenAppsComponent;
  let fixture: ComponentFixture<AlmacenAppsComponent>;

  beforeEach(waitForAsync(() => {
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
