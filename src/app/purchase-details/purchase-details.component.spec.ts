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

  it('should use the actual sold price instead of the expected retail price for profit/loss', () => {
    component.purchase = {
      products: [
        { productId: 1, retailPrice: 100, cost: 70 },
        { productId: 2, retailPrice: 50, cost: 30 }
      ]
    };

    component.soldProducts = [
      { productId: 1, qty: 2, retailPrice: 90, totalAmount: 180 },
      { productId: 1, qty: 1, retailPrice: 120, totalAmount: 120 },
      { productId: 2, qty: 2, retailPrice: 45, totalAmount: 90 }
    ];

    expect(component.getProductTotalSellingPrice({ productId: 1, retailPrice: 100 })).toBe(300);
    expect(component.getProductProfitLoss({ productId: 1, cost: 70 })).toBe(160);
    expect(component.calculateTotalAssignedSellingPrice()).toBe(150);
  });

  it('should include quantity when calculating remaining selling value', () => {
    component.purchase = {
      products: [
        { productId: 1, qty: 3, retailPrice: 100, cost: 70 },
        { productId: 2, qty: 2, retailPrice: 50, cost: 30 }
      ]
    };

    component.soldProducts = [
      { soldProducts: [{ productId: 1, qty: 1, retailPrice: 100, totalAmount: 100 }] }
    ];

    expect(component.getRemainingSellingPrice({ productId: 1, qty: 3, retailPrice: 100 })).toBe(200);
    expect(component.calculateTotalRemainingSellingPrice()).toBe(250);
  });
});
