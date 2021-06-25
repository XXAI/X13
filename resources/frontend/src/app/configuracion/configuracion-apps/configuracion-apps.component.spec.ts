import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionAppsComponent } from './configuracion-apps.component';

describe('ConfiguracionAppsComponent', () => {
  let component: ConfiguracionAppsComponent;
  let fixture: ComponentFixture<ConfiguracionAppsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfiguracionAppsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfiguracionAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
