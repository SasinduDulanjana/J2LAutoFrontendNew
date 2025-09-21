import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedSaleListComponent } from './deleted-sale-list.component';

describe('DeletedSaleListComponent', () => {
  let component: DeletedSaleListComponent;
  let fixture: ComponentFixture<DeletedSaleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeletedSaleListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedSaleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
