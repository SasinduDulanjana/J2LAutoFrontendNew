import { Product } from "./product.model";

export class SaleProduct {
  product: Product;
  quantity: number;
  discountedTotal: number;
  discountPercentage: number;
  discountAmount: number;
  retailPrice: number;
  batchNo?: string;
  productDeliveryStatus?: string;

  constructor(
    product: Product,
    quantity: number,
    discountedTotal: number,
    discountPercentage: number,
    discountAmount: number,
    retailPrice: number
  ) {
    this.product = product;
    this.quantity = quantity;
    this.discountedTotal = discountedTotal;
    this.discountPercentage = discountPercentage;
    this.discountAmount = discountAmount;
    this.retailPrice = retailPrice;
  }

}
