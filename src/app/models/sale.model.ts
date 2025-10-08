import { SaleProduct } from './sale-product.model';
import { Batch } from './batch.model';

export class Sale {
  saleDate?: string;
  saleId?: number; // For backend mapping
  id?: number; // Optional field
  customer?: any;
  user?: any;
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
  paymentMethod?: string;
  chequeNumber?: string;
  bankName?: string;
  chequeDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
  vehicle?: any;
  vehicleNumber?: string;

  constructor(
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
  customer?: any,
  user?: any,
  id?: number,
  modifiedBy?: string,
  modifiedDate?: string
  ) {
    if (customer) {
      this.customer = customer;
    }
    if (user) {
      this.user = user;
    }
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
