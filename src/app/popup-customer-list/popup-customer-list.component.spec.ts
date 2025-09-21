import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupCustomerListComponent } from './popup-customer-list.component';

describe('PopupCustomerListComponent', () => {
  let component: PopupCustomerListComponent;
  let fixture: ComponentFixture<PopupCustomerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupCustomerListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupCustomerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
