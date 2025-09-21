import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldSaleListComponent } from './hold-sale-list.component';

describe('HoldSaleListComponent', () => {
  let component: HoldSaleListComponent;
  let fixture: ComponentFixture<HoldSaleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoldSaleListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoldSaleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
