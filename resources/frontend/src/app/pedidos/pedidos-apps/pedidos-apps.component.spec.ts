import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosAppsComponent } from './pedidos-apps.component';

describe('PedidosAppsComponent', () => {
  let component: PedidosAppsComponent;
  let fixture: ComponentFixture<PedidosAppsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidosAppsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidosAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
