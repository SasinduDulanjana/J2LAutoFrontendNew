import { SaleProduct } from './sale-product.model';
import { Batch } from './batch.model';

export class Sale {
  saleId?: number; // For backend mapping
  id?: number; // Optional field
  custId: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  subTotal: number;
  billWiseDiscountPercentage: number;
  billWiseDiscountTotalAmount: number;
  lineWiseDiscountTotalAmount: number;
  invoiceNumber: string;
  soldProducts: SaleProduct[];
  isFullyPaid: boolean;
  isHold: boolean;
  paidAmount : number;
  paymentType?: string;
  modifiedBy?: string;
  modifiedDate?: string;

  constructor(
    custId: number,
    userId: number,
    orderDate: string,
    totalAmount: number,
    subTotal: number,
    billWiseDiscountPercentage: number,
    billWiseDiscountTotalAmount: number,
    lineWiseDiscountTotalAmount: number,
    invoiceNumber: string,
    soldProducts: SaleProduct[],
    isFullyPaid: boolean,
    isHold: boolean,
    paidAmount : number,
    id?: number,
    modifiedBy?: string,
    modifiedDate?: string
  ) {
    this.custId = custId;
    this.userId = userId;
    this.orderDate = orderDate || new Date().toISOString();
    this.totalAmount = totalAmount;
    this.subTotal = subTotal;
    this.billWiseDiscountPercentage = billWiseDiscountPercentage;
    this.billWiseDiscountTotalAmount = billWiseDiscountTotalAmount;
    this.lineWiseDiscountTotalAmount = lineWiseDiscountTotalAmount;
    this.invoiceNumber = invoiceNumber;
    this.soldProducts = soldProducts;
    this.isFullyPaid = isFullyPaid;
    this.isHold = isHold;
    this.paidAmount = paidAmount;
    if (id) {
      this.id = id;
    }
    if (modifiedBy) {
      this.modifiedBy = modifiedBy;
    }
    if (modifiedDate) {
      this.modifiedDate = modifiedDate;
    }
  }
}
