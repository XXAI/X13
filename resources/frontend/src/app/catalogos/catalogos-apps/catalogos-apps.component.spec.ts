import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CatalogosAppsComponent } from './catalogos-apps.component';

describe('CatalogosAppsComponent', () => {
  let component: CatalogosAppsComponent;
  let fixture: ComponentFixture<CatalogosAppsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogosAppsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogosAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
