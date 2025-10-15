// Quick mapping test for invoice-page.mapSaleToInvoiceData
// This script uses the sample sale JSON provided and runs a JS implementation
// of mapSaleToInvoiceData to show the computed saleItems and retailPrice.

const sale = {
    "statusCode": "201",
    "desc": "Sale Created Successfully",
    "saleId": 125,
    "customer": {
        "custId": 20,
        "name": "Mag City Deshan",
        "email": "",
        "phone": "+94770778497",
        "address": "Gatambe",
        "status": 1,
        "addBy": "SachiraHerath",
        "modifiedBy": "SachiraHerath",
        "addedDate": "2025-10-08T16:17:25.983+05:30",
        "modifiedDate": "2025-10-08T16:17:25.983+05:30"
    },
    "user": null,
    "saleDate": "13-10-2025 20:33:39",
    "totalAmount": 3000.0,
    "subTotal": 3000.0,
    "paymentMethod": "",
    "billWiseDiscountPercentage": null,
    "billWiseDiscountTotalAmount": null,
    "lineWiseDiscountTotalAmount": null,
    "invoiceNumber": "INV-819595",
    "soldProducts": [
        {
            "saleProductId": 135,
            "sale": {
                "saleId": 125,
                "customer": {
                    "custId": 20,
                    "name": "Mag City Deshan",
                    "email": "",
                    "phone": "+94770778497",
                    "address": "Gatambe",
                    "status": 1,
                    "addBy": "SachiraHerath",
                    "modifiedBy": "SachiraHerath",
                    "addedDate": "2025-10-08T16:17:25.983+05:30",
                    "modifiedDate": "2025-10-08T16:17:25.983+05:30"
                },
                "user": {
                    "id": 1,
                    "username": "SUPER ADMIN",
                    "password": "$2a$10$gGvhIbKZCyK80ITITMDjx.kiGk1eolU7cST4f.59YzfWp9D7BKifK",
                    "email": "sasidulaaa.kt03@gmail.com",
                    "status": "1",
                    "roles": [
                        {
                            "id": 1,
                            "name": "SUPER ADMIN",
                            "description": "Admin with all feature access",
                            "status": "1"
                        }
                    ]
                },
                "saleDate": "2025-10-13T20:33:39.593+05:30",
                "totalAmount": 3000.0,
                "subTotal": 3000.0,
                "paymentMethod": "",
                "billWiseDiscountPercentage": 0.0,
                "billWiseDiscountTotalAmount": 0.0,
                "lineWiseDiscountTotalAmount": 0.0,
                "invoiceNumber": "INV-819595",
                "status": 1,
                "paidAmount": 0.0,
                "saleProducts": [
                    {
                        "saleProductId": 135,
                        "product": {
                            "productId": 39,
                            "category": null,
                            "productName": "Rh winker lamp",
                            "isBarCodeAvailable": false,
                            "barcode": "",
                            "sku": "SKU-NN6DODFQ",
                            "barCodeType": "",
                            "productType": "",
                            "productStatus": "",
                            "description": "",
                            "isStockManagementEnable": false,
                            "lowQty": "2",
                            "isExpDateAvailable": false,
                            "expDate": "",
                            "taxGroup": "",
                            "taxType": "",
                            "imgUrl": "",
                            "batchNo": "",
                            "remainingQty": null,
                            "status": 1,
                            "brandName": null,
                            "partNumber": null,
                            "addBy": "SachiraHerath",
                            "modifiedBy": "SachiraHerath",
                            "addedDate": "2025-10-08T16:15:52.147+05:30",
                            "modifiedDate": "2025-10-08T16:15:52.147+05:30",
                            "vehicle": {
                                "id": 5,
                                "name": null,
                                "make": "Toyota",
                                "model": "Aqua",
                                "year": 2015
                            },
                            "stockManagementEnable": false,
                            "expDateAvailable": false,
                            "barCodeAvailable": false
                        },
                        "quantity": 1,
                        "discountedTotal": 3000.0,
                        "discountPercentage": 0.0,
                        "discountAmount": 0.0,
                        "batchNo": "RHW7310",
                        "status": "PENDING",
                        "retailPrice": 3000.0
                    }
                ],
                "vehicle": null,
                "vehicleNumber": "",
                "addBy": "SUPER ADMIN",
                "modifiedBy": "SUPER ADMIN",
                "addedDate": "2025-10-13T20:34:00.044+05:30",
                "modifiedDate": "2025-10-13T20:34:00.044+05:30",
                "fullyPaid": false,
                "hold": false
            },
            "product": {
                "productId": 39,
                "category": null,
                "productName": "Rh winker lamp",
                "isBarCodeAvailable": false,
                "barcode": "",
                "sku": "SKU-NN6DODFQ",
                "barCodeType": "",
                "productType": "",
                "productStatus": "",
                "description": "",
                "isStockManagementEnable": false,
                "lowQty": "2",
                "isExpDateAvailable": false,
                "expDate": "",
                "taxGroup": "",
                "taxType": "",
                "imgUrl": "",
                "batchNo": "",
                "remainingQty": null,
                "status": 1,
                "brandName": null,
                "partNumber": null,
                "addBy": "SachiraHerath",
                "modifiedBy": "SachiraHerath",
                "addedDate": "2025-10-08T16:15:52.147+05:30",
                "modifiedDate": "2025-10-08T16:15:52.147+05:30",
                "vehicle": {
                    "id": 5,
                    "name": null,
                    "make": "Toyota",
                    "model": "Aqua",
                    "year": 2015
                },
                "stockManagementEnable": false,
                "expDateAvailable": false,
                "barCodeAvailable": false
            },
            "quantity": 1,
            "discountedTotal": 3000.0,
            "discountPercentage": 0.0,
            "discountAmount": 0.0,
            "batchNo": "RHW7310",
            "retailPrice": null,
            "refundedAmount": null,
            "refundedQty": null,
            "productDeliveryStatus": null
        }
    ],
    "status": null,
    "isFullyPaid": false,
    "paidAmount": 0.0,
    "isHold": null,
    "addBy": null,
    "modifiedBy": null,
    "addedDate": null,
    "modifiedDate": null,
    "outstandingBalance": null,
    "vehicle": null,
    "vehicleNumber": null,
    "fullyPaid": false,
    "hold": null
};

function mapSaleToInvoiceData(sale) {
  const invoice = {};
  invoice.invoiceNumber = sale.invoiceNumber || sale.invoiceNo || sale.id || '';
  invoice.saleDate = sale.saleDate || sale.orderDate || sale.createdAt || '';
  invoice.currentDate = invoice.saleDate || new Date().toLocaleString();
  invoice.loggedUserName = (function getUsernameFromSale(sale) {
    if (!sale) return '';
    if (sale.user) {
      if (sale.user.username) return sale.user.username;
      if (sale.user.name) return sale.user.name;
    }
    if (sale.addBy) return sale.addBy;
    if (sale.modifiedBy) return sale.modifiedBy;
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
  })(sale);
  invoice.selectedCustomerName = (sale && sale.customer && sale.customer.name) || sale.customerName || sale.custName || '';
  invoice.vehicle = sale.vehicle || null;
  invoice.vehicleNumber = sale.vehicleNumber || sale.vehicleNo || '';

  const rawItems = sale.soldProducts || sale.soldItems || sale.saleItems || [];
  const items = (rawItems || []).map(p => {
    let retail = (p && (p.retailPrice ?? p.price)) ?? (p && p.product && p.product.retailPrice) ?? null;
    const needSearch = retail === null || retail === undefined || retail === 0;
    if (needSearch) {
      const candidateArrays = [];
      if (sale) {
        if (Array.isArray(sale.saleProducts)) candidateArrays.push(sale.saleProducts);
        if (Array.isArray(sale.soldProducts)) candidateArrays.push(sale.soldProducts);
      }
      if (p && p.sale) {
        if (Array.isArray(p.sale.saleProducts)) candidateArrays.push(p.sale.saleProducts);
        if (Array.isArray(p.sale.soldProducts)) candidateArrays.push(p.sale.soldProducts);
      }
      console.log('--- Debug: candidate arrays lengths ---');
      candidateArrays.forEach((a, idx) => console.log(idx, Array.isArray(a) ? a.length : typeof a));
      const pProdId = (p && ((p.product && (p.product.productId ?? p.product.id)) || p.productId)) ?? null;
      console.log('pProdId=', pProdId);
      if (pProdId) {
        for (let arrIndex = 0; arrIndex < candidateArrays.length; arrIndex++) {
          const arr = candidateArrays[arrIndex];
          console.log('checking candidate array index', arrIndex);
          if (!Array.isArray(arr)) continue;
          const match = arr.find(sp => {
            const spProdId = (sp && ((sp.product && (sp.product.productId ?? sp.product.id)) || sp.productId)) ?? null;
            return spProdId && spProdId === pProdId;
          });
          console.log('checked arr index', arrIndex, 'match=', match ? JSON.stringify(match) : null);
          if (match) {
            const candidateRetail = match.retailPrice ?? match.price ?? (match.product && match.product.retailPrice) ?? null;
            if (candidateRetail !== null && candidateRetail !== undefined && candidateRetail !== 0) {
              retail = candidateRetail;
              break;
            }
            // else continue searching
          }
        }
      }
    }
    if (retail === null || retail === undefined) retail = 0;
    return {
      productName: (p && ((p.product && p.product.productName) || p.productName)) || p && p.name || p && p.partName || '',
      remainingQty: (p && (p.quantity ?? p.remainingQty ?? p.qty)) || 0,
      retailPrice: retail,
      discountPercentage: (p && (p.discountPercentage ?? p.discountPercent)) || 0,
      discountAmount: (p && p.discountAmount) || 0
    };
  });

  invoice.saleItems = items;
  invoice.subtotal = sale.subTotal ?? sale.subtotal ?? items.reduce((s, it) => s + ((it.retailPrice || 0) * (it.remainingQty || 0)), 0);
  invoice.billWiseDiscountTotal = sale.billWiseDiscountTotalAmount ?? sale.billWiseDiscountTotal ?? sale.totalDiscount ?? 0;
  invoice.netTotal = sale.totalAmount ?? sale.netTotal ?? (invoice.subtotal - invoice.billWiseDiscountTotal);
  return invoice;
}

const invoiceData = mapSaleToInvoiceData(sale);
console.log('Computed invoiceData.saleItems:');
console.log(JSON.stringify(invoiceData.saleItems, null, 2));
