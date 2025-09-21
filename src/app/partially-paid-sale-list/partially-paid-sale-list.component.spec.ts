import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartiallyPaidSaleListComponent } from './partially-paid-sale-list.component';

describe('PartiallyPaidSaleListComponent', () => {
  let component: PartiallyPaidSaleListComponent;
  let fixture: ComponentFixture<PartiallyPaidSaleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartiallyPaidSaleListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartiallyPaidSaleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
