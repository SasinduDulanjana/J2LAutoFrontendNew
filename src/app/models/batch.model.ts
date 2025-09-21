export class Batch {
    batchId?: number; // Optional field
    sku: string;
    batchNumber: string;
    unitCost: number;
    qty: number;
    retailPrice: number;
    wholesalePrice: number;
    supplier: number;
    purchaseDate: number;
    invoiceNumber: number;
    // other fields...

    constructor(sku: string,batchNumber: string,unitCost: number,retailPrice: number, wholesalePrice: number, supplier: number, purchaseDate: number, invoiceNumber: number, qty: number, batchId?: number) {
      this.supplier = supplier;
      this.unitCost = unitCost;
      this.retailPrice = retailPrice;
      this.qty = qty;
      this.wholesalePrice = wholesalePrice;
      this.batchNumber = batchNumber;
      this.sku = sku;
      this.purchaseDate = purchaseDate;
      this.invoiceNumber = invoiceNumber
      if (batchId) {
        this.batchId = batchId;
      }
    }
}
