import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListPopupComponent } from './product-list-popup.component';

describe('ProductListPopupComponent', () => {
  let component: ProductListPopupComponent;
  let fixture: ComponentFixture<ProductListPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductListPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductListPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
