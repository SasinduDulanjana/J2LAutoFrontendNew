import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountBillWiseComponent } from './discount-bill-wise.component';

describe('DiscountBillWiseComponent', () => {
  let component: DiscountBillWiseComponent;
  let fixture: ComponentFixture<DiscountBillWiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscountBillWiseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountBillWiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
