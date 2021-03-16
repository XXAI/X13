import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PedidosAppsComponent } from './pedidos-apps.component';

describe('PedidosAppsComponent', () => {
  let component: PedidosAppsComponent;
  let fixture: ComponentFixture<PedidosAppsComponent>;

  beforeEach(waitForAsync(() => {
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
