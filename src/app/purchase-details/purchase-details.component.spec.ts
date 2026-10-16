import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseDetailsComponent } from './purchase-details.component';

describe('PurchaseDetailsComponent', () => {
  let component: PurchaseDetailsComponent;
  let fixture: ComponentFixture<PurchaseDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should total the assigned selling price column for all products', () => {
    component.purchase = {
      products: [
        { productId: 1, retailPrice: 100 },
        { productId: 2, retailPrice: 50 },
        { productId: 3, retailPrice: 75 }
      ]
    };

    expect(component.calculateTotalAssignedSellingPrice()).toBe(225);
  });
});
