import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleService } from '../services/sale.service';

@Component({
  selector: 'app-invoice-page',
  templateUrl: './invoice-page.component.html',
  styleUrls: ['./invoice-page.component.scss']
})
export class InvoicePageComponent implements OnInit {
  invoiceData: any;

  constructor(private route: ActivatedRoute, private router: Router, private saleService: SaleService) {}

  ngOnInit(): void {
    // If invoiceNumber query param provided, fetch the sale data from backend
    const invoiceNumber = this.route.snapshot.queryParamMap.get('invoiceNumber');
    if (invoiceNumber) {
      this.saleService.getSaleByInvoiceNumber(invoiceNumber).subscribe({
        next: (sale) => {
          this.invoiceData = this.mapSaleToInvoiceData(sale || {});
        },
        error: () => {
          // fallback to navigation state or redirect
          this.invoiceData = history.state.invoiceData || {};
          if (!this.invoiceData || !this.invoiceData.invoiceNumber) {
            this.router.navigate(['/create-sale']);
          }
        }
      });
    } else {
      // Get invoice data from navigation extras (state)
      const stateData = history.state.invoiceData || {};
      this.invoiceData = Object.keys(stateData).length ? this.mapSaleToInvoiceData(stateData) : {};
      // If no data, redirect back to sale page
      if (!this.invoiceData || !this.invoiceData.invoiceNumber) {
        this.router.navigate(['/create-sale']);
      }
    }
  }

  private mapSaleToInvoiceData(sale: any): any {
    // If a wrapper object was passed (navigation state may contain { sale: {...} } or { invoiceData: {...} }),
    // unwrap common wrappers so mapping finds customer/user/vehicle fields.
    let src: any = sale || {};
    if (src.sale && typeof src.sale === 'object') src = src.sale;
    else if (src.invoiceData && typeof src.invoiceData === 'object') src = src.invoiceData;
    else if (src.saleItem && typeof src.saleItem === 'object') src = src.saleItem;
    else if (src.data && typeof src.data === 'object') src = src.data;

    // Normalize backend sale object to invoice template shape
    const invoice: any = {};
    invoice.invoiceNumber = src.invoiceNumber || src.invoiceNo || src.id || '';
    invoice.saleDate = src.saleDate || src.orderDate || src.createdAt || '';
    invoice.currentDate = invoice.saleDate || new Date().toLocaleString();
    invoice.loggedUserName = this.getUsernameFromSale(src);
    invoice.selectedCustomerName = src.customer?.name || src.customerName || src.custName || '';
    // vehicle can be on the sale itself, or inside a nested sale object on soldProducts, or on the product
    const nestedSale = (src?.soldProducts && src.soldProducts[0] && src.soldProducts[0].sale) || (src?.saleProducts && src.saleProducts[0] && src.saleProducts[0].sale) || null;
    const firstProductVehicle = (src?.saleProducts && src.saleProducts[0]?.product?.vehicle) || (src?.soldProducts && src.soldProducts[0]?.product?.vehicle) || null;
    invoice.vehicle = src?.vehicle ?? nestedSale?.vehicle ?? firstProductVehicle ?? null;
    invoice.vehicleNumber = src?.vehicleNumber ?? src?.vehicleNo ?? nestedSale?.vehicleNumber ?? nestedSale?.vehicleNo ?? '';
    // Map line items: template expects saleItems with productName, remainingQty, retailPrice, discountPercentage
    const items = (sale.soldProducts || sale.soldItems || sale.saleItems || []).map((p: any) => {
      // Start with item/product level prices
      let retail: any = p?.retailPrice ?? p?.price ?? p?.product?.retailPrice ?? null;

      // If not present or zero, try to find matching saleProduct entry and use its retailPrice
      const needSearch = retail === null || retail === undefined || retail === 0;
      if (needSearch) {
        const candidateArrays: any[] = [];
        if (sale) {
          if (Array.isArray(sale.saleProducts)) candidateArrays.push(sale.saleProducts);
          if (Array.isArray(sale.soldProducts)) candidateArrays.push(sale.soldProducts);
        }
        // also check if this soldProduct contains a nested sale with saleProducts
        if (p && p.sale) {
          if (Array.isArray(p.sale.saleProducts)) candidateArrays.push(p.sale.saleProducts);
          if (Array.isArray(p.sale.soldProducts)) candidateArrays.push(p.sale.soldProducts);
        }

        const pProdId = p?.product?.productId ?? p?.productId ?? p?.product?.id ?? p?.product?._id ?? null;
        if (pProdId) {
          for (const arr of candidateArrays) {
            if (!Array.isArray(arr)) continue;
            const match = arr.find((sp: any) => {
              const spProdId = sp?.product?.productId ?? sp?.productId ?? sp?.product?.id ?? sp?.product?._id ?? null;
              return spProdId && spProdId === pProdId;
            });
            if (match) {
              const candidateRetail = match?.retailPrice ?? match?.price ?? match?.product?.retailPrice ?? null;
              // If candidateRetail is a usable number (>0 or non-null), use it and stop.
              if (candidateRetail !== null && candidateRetail !== undefined && candidateRetail !== 0) {
                retail = candidateRetail;
                break;
              }
              // otherwise continue searching other arrays for a non-empty price
            }
          }
        }
      }

      if (retail === null || retail === undefined) retail = 0;

      return {
        productName: p?.product?.productName || p?.productName || p?.name || p?.partName || '',
        remainingQty: p?.quantity ?? p?.remainingQty ?? p?.qty ?? 0,
        retailPrice: retail,
        discountPercentage: p?.discountPercentage ?? p?.discountPercent ?? 0,
        discountAmount: p?.discountAmount ?? 0
      };
    });
    invoice.saleItems = items;
    invoice.subtotal = sale.subTotal ?? sale.subtotal ?? items.reduce((s: number, it: any) => s + ((it.retailPrice || 0) * (it.remainingQty || 0)), 0);
    invoice.billWiseDiscountTotal = sale.billWiseDiscountTotalAmount ?? sale.billWiseDiscountTotal ?? sale.totalDiscount ?? 0;
      invoice.netTotal = sale.totalAmount ?? sale.netTotal ?? (invoice.subtotal - invoice.billWiseDiscountTotal);
      // Debug: print mapped invoice for verification when loading invoice page
      // Remove or guard this in production if needed
      console.log('Mapped invoiceData:', invoice);
    return invoice;
  }

  private getUsernameFromSale(sale: any): string {
    if (!sale) return '';
    // Direct user object
    if (sale.user) {
      if (sale.user.username) return sale.user.username;
      if (sale.user.name) return sale.user.name;
    }
    // Common string fields
    if (sale.addBy) return sale.addBy;
    if (sale.modifiedBy) return sale.modifiedBy;

    // Nested sale inside soldProducts
    const nested = (sale.soldProducts && sale.soldProducts[0] && sale.soldProducts[0].sale) || (sale.saleProducts && sale.saleProducts[0] && sale.saleProducts[0].sale);
    if (nested) {
      if (nested.user) {
        if (nested.user.username) return nested.user.username;
        if (nested.user.name) return nested.user.name;
      }
      if (nested.addBy) return nested.addBy;
      if (nested.modifiedBy) return nested.modifiedBy;
    }

    return '';
  }

  printBill() {
    window.print();
  }

  startNewTransaction() {
    this.router.navigate(['/create-sale']);
  }
}
