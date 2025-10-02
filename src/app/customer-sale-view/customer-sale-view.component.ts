import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SaleService } from '../services/sale.service';

@Component({
  selector: 'app-customer-sale-view',
  templateUrl: './customer-sale-view.component.html',
  styleUrls: ['./customer-sale-view.component.scss']
})
export class CustomerSaleViewComponent implements OnInit {
  saleId: string = '';
  customerName: string = '';
  items: any[] = [];
  loading = true;

  constructor(private route: ActivatedRoute, private saleService: SaleService) {}

  ngOnInit(): void {
    this.saleId = this.route.snapshot.paramMap.get('id') || '';
    this.saleService.fetchSaleProductsOfCustomerView(this.saleId).subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      }
    });
  }

  markAsReceived(item: any) {
    this.loading = true;
    const payload = {
      saleId: Number(this.saleId),
      productId: item.productId,
      batchNo: item.batchNo,
      status: 'RECEIVED'
    };
    this.saleService.updateProductStatus(payload).subscribe({
      next: () => {
        item.status = 'RECEIVED'; // Update UI instantly
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
