import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogosAppsComponent } from './catalogos-apps.component';

describe('CatalogosAppsComponent', () => {
  let component: CatalogosAppsComponent;
  let fixture: ComponentFixture<CatalogosAppsComponent>;

  beforeEach(async(() => {
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
