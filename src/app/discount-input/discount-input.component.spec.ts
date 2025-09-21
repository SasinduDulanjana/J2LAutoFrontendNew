import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountInputComponent } from './discount-input.component';

describe('DiscountInputComponent', () => {
  let component: DiscountInputComponent;
  let fixture: ComponentFixture<DiscountInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscountInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
