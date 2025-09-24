export class Product {
  category?: any;
  batchQuantities?: { batchNo: string; qty: number, cost: number, retailPrice: number, wholesalePrice: number }[];
    productId?: number; // Optional field
    catId: number;
    productName: string;
    isBarCodeAvailable: boolean;
    barCode: string;
    sku: string;
    barCodeType: string;
    productType: string;
    productStatus: string;
    description: string;
    isStockManagementEnable: boolean;
    cost: number;
    retailPrice: number;
    salePrice: number;
    wholeSalePrice: number;
    lowQty: string;
    isExpDateAvailable: boolean;
    expDate: string;
    taxGroup: string;
    taxType: string;
    imgUrl: string;
    batchNo: string;
    status: number;
    stockManagementEnable: boolean;
    barCodeAvailable: boolean;
    expDateAvailable: boolean;
    remainingQty: number;
    discountPercentage?: number;
    discountAmount?: number;

    // other fields...

    constructor(
      catId: number,
      productName: string,
      isBarCodeAvailable: boolean,
      barCode: string,
      sku: string,
      barCodeType: string,
      productType: string,
      productStatus: string,
      description: string,
      isStockManagementEnable: boolean,
      cost: number,
      retailPrice: number,
      salePrice: number,
      wholeSalePrice: number,
      lowQty: string,
      isExpDateAvailable: boolean,
      expDate: string,
      taxGroup: string,
      taxType: string,
      imgUrl: string,
      batchNo: string,
      status: number,
      stockManagementEnable: boolean,
      barCodeAvailable: boolean,
      expDateAvailable: boolean,
      remainingQty: number,
      productId?: number,
      discountPercentage?: number,
      discountAmount?: number,){
      this.catId = catId;
      this.productName = productName;
      this.isBarCodeAvailable = isBarCodeAvailable;
      this.barCode = barCode;
      this.sku = sku;
      this.barCodeType = barCodeType;
      this.productType = productType;
      this.productStatus = productStatus;
      this.description = description;
      this.isStockManagementEnable = isStockManagementEnable;
      this.cost = cost;
      this.retailPrice = retailPrice;
      this.salePrice = salePrice;
      this.wholeSalePrice = wholeSalePrice;
      this.lowQty = lowQty;
      this.isExpDateAvailable = isExpDateAvailable;
      this.expDate = expDate;
      this.taxGroup = taxGroup;
      this.taxType = taxType;
      this.imgUrl = imgUrl;
      this.batchNo = batchNo;
      this.status = status;
      this.stockManagementEnable = stockManagementEnable;
      this.barCodeAvailable = barCodeAvailable;
      this.expDateAvailable = expDateAvailable;
      this.remainingQty = remainingQty;
      if (productId) {
        this.productId = productId;
      }
      if (discountPercentage) {
        this.discountPercentage = discountPercentage;
      }
      if (discountAmount) {
        this.discountAmount = discountAmount;
      }

    }
  
    
}

    