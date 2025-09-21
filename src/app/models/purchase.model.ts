import { Product } from "./product.model";

export class Purchase {
    purchaseId?: number; // Optional field
    supId: number;
    purchaseName: string;
    invoiceNumber: string;
    deliveryTime: string;
    invoiceDate: string;
    paymentStatus: string;
    products: Product[];
    totalCost: number;
    paidAmount: number;
    isFullyPaid: boolean;

    constructor(
      supId: number,
      purchaseName: string,
      invoiceNumber: string,
      deliveryTime: string,
      invoiceDate: string,
      paymentStatus: string,
      products: Product[],
      totalCost: number = 0,
      paidAmount: number = 0,
      isFullyPaid: boolean = false,
      purchaseId?: number
    ) {
      this.supId = supId;
      this.purchaseName = purchaseName;
      this.invoiceNumber = invoiceNumber;
      this.deliveryTime = deliveryTime;
      this.invoiceDate = invoiceDate;
      this.paymentStatus = paymentStatus;
      this.products = products;
      this.totalCost = totalCost;
      this.paidAmount = paidAmount;
      this.isFullyPaid = isFullyPaid;
      if (purchaseId) {
        this.purchaseId = purchaseId;
      }
    }
}
