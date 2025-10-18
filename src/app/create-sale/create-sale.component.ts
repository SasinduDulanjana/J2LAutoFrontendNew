import { Component, OnInit } from '@angular/core';
import { SaleService } from '../services/sale.service';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { Batch } from '../models/batch.model';
import { Sale } from '../models/sale.model';
import { SaleProduct } from '../models/sale-product.model';
import { CustomerService } from '../services/customer.service';
import { PopupCustomerListComponent } from '../popup-customer-list/popup-customer-list.component';
import { CreateCustomerComponent } from '../create-customer/create-customer.component';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';
import { BillDialogComponent } from '../bill/bill-dialog.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';
import { QuantityInputComponent } from '../quantity-input/quantity-input.component';
import { BatchSelectionComponent } from '../batch-selection/batch-selection.component';
import { DiscountInputComponent } from '../discount-input/discount-input.component';
import { DiscountBillWiseComponent } from '../discount-bill-wise/discount-bill-wise.component';
import { CategoryService } from '../services/category.service';
import { ProductListComponent } from '../product-list/product-list.component';
import { CreateProductComponent } from '../create-product/create-product.component';
import { CreatePurchaseComponent } from '../create-purchase/create-purchase.component';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { InventoryListComponent } from '../inventory-list/inventory-list.component';
import { VehicleService } from '../services/vehicle.service';
import { CreateVehicleComponent } from '../create-vehicle/create-vehicle.component';

@Component({
  selector: 'app-create-sale',
  templateUrl: './create-sale.component.html',
  styleUrls: ['./create-sale.component.scss']
})
export class CreateSaleComponent implements OnInit {
  openCreateVehiclePopup(): void {
    const dialogRef = this.dialog.open(
      CreateVehicleComponent, // Replace with your actual CreateVehicleComponent if available
      {
        width: '500px',
        disableClose: false
      }
    );
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.vehicle) {
        // Refresh vehicle list and sort alphabetically
        this.vehicleService.getAllVehicles().subscribe((data: any[] = []) => {
          this.vehicles = data.sort((a: any, b: any) => {
            const aStr = `${a.make} ${a.model} ${a.year}`.toLowerCase();
            const bStr = `${b.make} ${b.model} ${b.year}`.toLowerCase();
            return aStr.localeCompare(bStr);
          });
        });
      }
    });
  }
  vehicles: any[] = [];
  vehicleResults: any[] = [];
  vehicleSearchTerm: string = '';
  selectedVehicle: any = null;
  vehicleNumber: string = '';

  // Customer inline search state
  customerResults: any[] = [];
  customerSearchTerm: string = '';
  

  searchVehicle(): void {
    const term = this.vehicleSearchTerm?.toLowerCase().trim() || '';
    if (!term) {
      this.vehicleResults = [];
      return;
    }
    // Split term for multi-field matching
    const parts = term.split(/\s+/);
    this.vehicleResults = this.vehicles.filter(v => {
      const make = (v.make || '').toLowerCase();
      const model = (v.model || '').toLowerCase();
      const year = String(v.year || '').toLowerCase();
      // Match all parts in any order
      return parts.every(p => make.includes(p) || model.includes(p) || year.includes(p));
    });
  }

  selectVehicle(vehicle: any): void {
    this.selectedVehicle = vehicle;
    this.vehicleSearchTerm = `${vehicle.make} ${vehicle.model} ${vehicle.year}`;
    this.vehicleResults = [];
  }

  // Inline customer search (similar behaviour to vehicle search)
  searchCustomer(): void {
    const term = this.customerSearchTerm?.toLowerCase().trim() || '';
    if (!term) {
      this.customerResults = [];
      return;
    }
    const parts = term.split(/\s+/);
    // Ensure customers list is loaded; if not, fetch once
    if (!this.customers || this.customers.length === 0) {
      this.customerService.findAllCustomers().subscribe(customers => {
        this.customers = customers || [];
        this.customerResults = this.customers.filter(c => {
          const name = (c.name || '').toLowerCase();
          const phone = (c.phone || '').toLowerCase();
          return parts.every(p => name.includes(p) || phone.includes(p));
        });
      }, err => {
        this.customerResults = [];
      });
      return;
    }

    this.customerResults = this.customers.filter(c => {
      const name = (c.name || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      return parts.every(p => name.includes(p) || phone.includes(p));
    });
  }

  selectCustomer(cust: any): void {
    this.saleItem.customer = cust;
    this.selectedCustomerId = cust.custId || cust.id || 0;
    this.selectedCustomerName = cust.name || 'Select Customer';
    this.customerSearchTerm = this.selectedCustomerName;
    this.customerResults = [];
  }
  onRetailPriceChange(item: any): void {
    // Only handle retail price change, update totals if needed
    // You can trigger recalculation of net total or other logic here
    // Example: this.getNetTotal(item) or this.getTotal()
  }
  openAddCustomerDialog(): void {
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      width: '600px',
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.customer) {
        // Add new customer to list and select
        const newCust = result.customer;
        try {
          const exists = this.customers.find(c => (c.custId && newCust.custId && c.custId === newCust.custId) || (c.id && newCust.id && c.id === newCust.id));
          if (!exists) this.customers.unshift(newCust);
        } catch (e) {
          this.customers.push(newCust);
        }
        this.saleItem.customer = newCust;
        this.selectedCustomerName = newCust.name;
        this.selectedCustomerId = newCust.custId || newCust.id || 0;

        // If the current search term would match the new customer, show it in dropdown immediately
        const term = (this.customerSearchTerm || '').toLowerCase().trim();
        if (!term || (newCust.name && newCust.name.toLowerCase().includes(term)) || (newCust.phone && newCust.phone.toLowerCase().includes(term))) {
          const existsInResults = this.customerResults.find(c => (c.custId && newCust.custId && c.custId === newCust.custId) || (c.id && newCust.id && c.id === newCust.id));
          if (!existsInResults) this.customerResults.unshift(newCust);
        }
      } else {
        // Refresh customer list to pick up any changes
        this.customerService.findAllCustomers().subscribe(customers => {
          this.customers = customers || [];
          // If there's an active search term, refresh filtered results
          if (this.customerSearchTerm && this.customerSearchTerm.trim().length > 0) {
            this.searchCustomer();
          }
        });
      }
    });
  }
  onDiscountAmountChange(item: any): void {
    // Only update percentage if retailPrice and remainingQty are valid
    const total = (item?.retailPrice ?? 0) * (item?.remainingQty ?? 0);
    if (total > 0 && typeof item.discountAmount === 'number' && !isNaN(item.discountAmount)) {
      item.discountPercentage = Math.round((item.discountAmount / total) * 100 * 100) / 100; // round to 2 decimals
    } else {
      item.discountPercentage = 0;
    }
  }
  getMaxQty(batchNo: string): number {
    const batch = this.batchList.find(b => b.batchNumber === batchNo);
    return batch && typeof batch.qty === 'number' ? batch.qty : 1;
  }

  getDiscountAmount(item: any): number {
    // If discountAmount is set and is a number, use it; otherwise calculate from percentage
    if (typeof item.discountAmount === 'number' && !isNaN(item.discountAmount)) {
      return item.discountAmount;
    }
    return ((item?.discountPercentage ?? 0) / 100 * (item?.retailPrice ?? 0) * (item?.remainingQty ?? 0));
  }

  getNetTotal(item: any): number {
    return ((item?.remainingQty ?? 0) * (item?.retailPrice ?? 0)) - this.getDiscountAmount(item);
  }
    qtyError: { [key: string]: string } = {};
    onQtyChange(item: any): void {
      // Use batch from item
      const batch = item.batch;
      // Sanitize input: allow only numbers
      if (typeof item.remainingQty === 'string') {
        item.remainingQty = item.remainingQty.replace(/[^0-9]/g, '');
        item.remainingQty = item.remainingQty ? parseInt(item.remainingQty, 10) : 1;
      }
      console.log('onQtyChange:', { batchNo: item.batchNo, batch, batchQty: batch ? batch.qty : undefined, enteredQty: item.remainingQty });
      // Validate quantity
      if (isNaN(item.remainingQty) || item.remainingQty < 1) {
        this.qtyError[item.batchNo] = 'Quantity must be at least 1';
      } else if (batch && typeof batch.qty === 'number' && item.remainingQty > batch.qty) {
        this.qtyError[item.batchNo] = `Cannot exceed available stock (${batch.qty})`;
      } else {
        this.qtyError[item.batchNo] = '';
      }
  // Recalculate totals
  this.saleItem.subTotal = this.getSubtotal();
  this.saleItem.totalAmount = this.getTotal();
  this.saleItem.lineWiseDiscountTotalAmount = this.getTotalDiscount();
  this.saleItem.billWiseDiscountTotalAmount = this.getTotalBillWiseDiscount();
  // If discountAmount is manually set, keep it
    }

    onQtyBlur(item: any): void {
      // Use batch from item
      const batch = item.batch;
      const maxQty = batch && typeof batch.qty === 'number' ? batch.qty : 1;
      console.log('onQtyBlur:', { batchNo: item.batchNo, batch, batchQty: batch ? batch.qty : undefined, enteredQty: item.remainingQty });
      if (item.remainingQty > maxQty) {
        item.remainingQty = maxQty;
        this.qtyError[item.batchNo] = `Quantity was adjusted to available stock (${maxQty})`;
  this.saleItem.subTotal = this.getSubtotal();
  this.saleItem.totalAmount = this.getTotal();
  this.saleItem.lineWiseDiscountTotalAmount = this.getTotalDiscount();
  this.saleItem.billWiseDiscountTotalAmount = this.getTotalBillWiseDiscount();
      } else if (isNaN(item.remainingQty) || item.remainingQty < 1) {
        this.qtyError[item.batchNo] = 'Quantity must be at least 1';
      } else {
        this.qtyError[item.batchNo] = '';
      }
    }
  loading: boolean = false;
  private loadingDialogRef: any;
  viewBill(): void {
    this.dialog.open(BillDialogComponent, {
      width: '700px',
      data: {
        saleItems: this.saleItems,
        customer: this.selectedCustomerName,
        invoiceNumber: this.invoiceNumber,
        date: this.currentDate,
        netTotal: this.getTotal(),
        subtotal: this.getSubtotal(),
        discounts: {
          lineWise: this.getTotalDiscount(),
          billWise: this.getTotalBillWiseDiscount(),
          billWisePercentage: this.billWiseDiscountPercentage
        }
      }
    });
  }
  productSearchTerm: string = '';
  paymentType: string = '';
  showBillButton: boolean = false;
  searchResults: Product[] = [];
  selectedProduct: Product | null = null;
  selectedBatch: Batch | null = null;
  saleQty: number = 1;
  saleItem: Sale;
  saleItems: any[] = [];

  batchList: Batch[] = [];
  showBatchSelection: boolean = false;
  currentDate: string = "";
  items = [
    { price: 1000, discountPercentage: 0, discountAmount: 0 },
    // add more items as needed
  ];
  invoiceNumber: string = "";
  customers: any[] = []; // List of all customers
  users: any[] = []; // List of all users
  filteredCustomers: any[] = []; // Filtered list of customers based on phone number
  phoneNumber: string = ''; // Input phone number
  selectedCustomerId: number = 0; // Selected customer ID
  selectedCustomerName: string = "Select Customer";
  placeholderRows: number[] = Array.from({ length: 20 }, (_, i) => i);
  categories: any[] = [];
  products: any[] = [];
  showProducts: boolean = false;
  loggedUserName: string = '';


  constructor(
    private saleService: SaleService,
    private productService: ProductService,
    private customerService: CustomerService,
    private dialog: MatDialog,
    private router: Router,
    private categoryService: CategoryService,
    private authService: AuthService,
    private userService: UserService,
    private vehicleService: VehicleService
  ) {
    this.saleItem = new Sale(
      "", // orderDate
      0, // totalAmount
      0, // subTotal
      0, // billWiseDiscountPercentage
      0, // billWiseDiscountTotalAmount
      0, // lineWiseDiscountTotalAmount
      "", // invoiceNumber
      [], // soldProducts
      true, // isFullyPaid
      false, // isHold
      0 // paidAmount
    );
  }

  ngOnInit(): void {
    // Fetch all vehicles for search
    this.vehicleService.getAllVehicles().subscribe(
      (vehicles: any[]) => {
        this.vehicles = vehicles;
      },
      (error) => {
        this.vehicles = [];
      }
    );
    // Auto-generate a temporary invoice number on page open
  const shortNum = (Date.now() % 1000000).toString().padStart(6, '0');
  this.invoiceNumber = `INV-${shortNum}`;
  this.saleItem.invoiceNumber = this.invoiceNumber;
    // Check for hold sale data in router state or browser history
    let holdSale: any = undefined;
    const nav = this.router.getCurrentNavigation();
    if (nav && nav.extras && nav.extras.state && nav.extras.state['holdSale']) {
      holdSale = nav.extras.state['holdSale'];
    } else if (history.state && history.state.holdSale) {
      holdSale = history.state.holdSale;
    }
    if (holdSale) {
      // Create a new Sale object, copying only needed fields, and set isHold to false
      this.saleItem = new Sale(
        holdSale.orderDate || new Date().toISOString(),
        holdSale.totalAmount,
        holdSale.subTotal,
        holdSale.billWiseDiscountPercentage,
        holdSale.billWiseDiscountTotalAmount,
        holdSale.lineWiseDiscountTotalAmount,
        '', // invoiceNumber will be fetched
        [], // soldProducts will be set below
        holdSale.isFullyPaid,
        false, // Always set isHold to false
        holdSale.paidAmount,
        this.customers.find((c: any) => c.custId === holdSale.custId),
        this.users.find((u: any) => u.id === holdSale.userId)
      );
      this.saleItem.saleId = 0; // Ensure saleId is not sent
      this.saleItems = holdSale.soldProducts ? holdSale.soldProducts.map((sp: any) => ({
        ...sp.product,
        batchNo: sp.batchNo,
        remainingQty: sp.quantity,
        retailPrice: sp.discountedTotal / sp.quantity, // fallback, adjust as needed
        discountAmount: sp.discountAmount ?? 0
      })) : [];
      this.selectedCustomerId = holdSale.custId;
      this.currentDate = holdSale.saleDate;
  // Removed getInvoiceNumber API call

      // Fetch customers and users if not already loaded
      this.customerService.findAllCustomers().subscribe(customers => {
        this.customers = customers;
        const foundCustomer = this.customers.find((c: any) => c.custId === holdSale.custId);
        this.selectedCustomerName = foundCustomer ? foundCustomer.name : 'Select Customer';
      });
      this.userService.getUsers().subscribe(users => {
        this.users = users;
        const foundUser = this.users.find((u: any) => u.id === holdSale.userId);
        this.loggedUserName = foundUser ? foundUser.username : '';
      });
    } else {
      // Get the current date and format it
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 10); // Format as YYYY-MM-DD for display
      // Store it in a variable
      this.currentDate = formattedDate;
  // Removed getInvoiceNumber API call
      this.fetchCategories();
      this.loggedUserName = this.getLoggedUserName();
      // Load all products for search bar
      this.productService.getAllProducts().subscribe((data: Product[]) => {
        this.products = data;
      });
    }
  }

  getLoggedUserName(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.name || payload.username || payload.sub || '';
    } catch {
      return '';
    }
  }

  searchProduct(): void {
    if (!this.productSearchTerm || !this.products || this.products.length === 0) {
      this.searchResults = [];
      return;
    }

    const term = this.productSearchTerm.toLowerCase();
    const terms = term.split(/\s+/).filter(Boolean);
    this.searchResults = this.products.filter(product => {
      // Basic fields
      const matchesBasic =
        (product.productName && product.productName.toLowerCase().includes(term)) ||
        (product.sku && product.sku.toLowerCase().includes(term)) ||
        (product.barCode && product.barCode.toLowerCase().includes(term));

      // Helper to match terms against vehicle object
      const matchVehicleObj = (v: any) => {
        if (!v) return false;
        // Match each term separately
        const termMatches = terms.every(t =>
          (v.make && v.make.toLowerCase().includes(t)) ||
          (v.model && v.model.toLowerCase().includes(t)) ||
          (v.year && v.year.toString().includes(t)) ||
          (product.productName && product.productName.toLowerCase().includes(t))
        );
        // Match combined string
        const combined = `${v.make || ''} ${v.model || ''} ${v.year || ''} ${product.productName || ''}`.toLowerCase();
        const combinedMatch = combined.includes(term);
        return termMatches || combinedMatch;
      };

      // Vehicle fields (single object)
      const matchesVehicleObj = matchVehicleObj(product.vehicle);

      return matchesBasic || matchesVehicleObj;
    });
  }

  handleKeypress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.searchResults.length > 0) {
      event.preventDefault(); // Prevent form submission
      this.selectProduct(this.searchResults[0]);
    }
  }

  // handleKeypressQty(event: KeyboardEvent): void {
  //   if (event.key === 'Enter') {
  //     this.addSaleItem();
  //   }
  // }

  selectBatch(batch: any): void {
    this.selectedBatch = batch; // Set the selected batch
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.productService.getBatchNumbersForProduct(product.sku).subscribe(
      (batches: Batch[]) => {
        this.batchList = batches;
        if (this.batchList.length === 1) {
          // Automatically add to sale items if only one batch
          this.addSaleItem(this.batchList[0], 1);
        } else {
          // Otherwise, show the modal or batch selection section
          const dialogRef = this.dialog.open(BatchSelectionComponent, {
            width: '1000px', // Set the width of the dialog
            data: { batchList: batches } // Pass the batch list as data
          });

          dialogRef.afterClosed().subscribe((selectedBatch: Batch) => {
            if (selectedBatch) {
              // Add to sale items with default quantity 1
              this.addSaleItem(selectedBatch, 1);
            }
          });
        }
      },
      error => {
        console.error('Error fetching batches:', error);
      }
    );

    // Clear the search term
    this.productSearchTerm = '';

    // Clear the search results
    this.searchResults = [];
  }

  addSaleItem(selectedBatch: Batch, saleQty: number): void {
    // Use availableQty from batch object instead of API
    const availableQty = selectedBatch.qty;
    if (saleQty <= 0 || saleQty > availableQty) {
      this.openFailureDialog('Requested quantity exceeds available stock.'); // Show error dialog
      return; // Exit the method if quantity is invalid
    }

    if (this.selectedProduct && selectedBatch) {
      const existingItem = this.saleItems.find(product =>
        product.productId === this.selectedProduct!.productId &&
        product.batchNo === selectedBatch!.batchNumber
      );
      if (existingItem) {
        // If the item already exists, update the quantity
        existingItem.remainingQty += (saleQty > 0 ? saleQty : 1);
      } else {
        // If the item doesn't exist, add a new entry to the sale array
        const newProduct = {
          ...this.selectedProduct,
          batchNo: selectedBatch.batchNumber,
          batch: selectedBatch, // Store batch object directly
          remainingQty: 1,
          retailPrice: selectedBatch.retailPrice,
          unitCost: selectedBatch.unitCost,
          discountAmount: 0
        };
        this.saleItems.push(newProduct);
      }
      this.resetSelection();
    }
  }

  resetSelection(): void {
    this.selectedProduct = null;
    this.selectedBatch = null;
    this.saleQty = 1;
    this.batchList = [];
    this.productSearchTerm = '';
  }

  removeSaleItem(productToRemove: Product): void {
    this.saleItems = this.saleItems.filter(product =>
      product.productId !== productToRemove.productId ||
      product.batchNo !== productToRemove.batchNo
    );
  }


  holdSale(): void {
    this.saleItem.isHold = true; // Set the isHold field to true
    // Assign logged-in user before saving
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const username = payload.sub;
        this.userService.getUserDetailsByUsername(username).subscribe(user => {
          this.saleItem.user = user;
          this.createSale(true, () => {
            this.dialog.open(SuccessDialogComponent, {
              width: '300px',
              data: { message: 'Sale saved as hold successfully!' }
            });
          });
        });
      } catch {
        this.saleItem.user = null;
        this.createSale(true, () => {
          this.dialog.open(SuccessDialogComponent, {
            width: '300px',
            data: { message: 'Sale saved as hold successfully!' }
          });
        });
      }
    } else {
      this.saleItem.user = null;
      this.createSale(true, () => {
        this.dialog.open(SuccessDialogComponent, {
          width: '300px',
          data: { message: 'Sale saved as hold successfully!' }
        });
      });
    }
  }

  createSale(isHold: boolean = false, onHoldSaved?: () => void): void {
    if (this.saleItem == null) {
      console.error('No items in the sale.');
      return;
    }
    // Validate customer selection
    if (!this.saleItem.customer) {
      this.openFailureDialog('Please select a customer before creating the sale.');
      return;
    }

    // Assign logged-in user before saving
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const username = payload.sub;
        this.userService.getUserDetailsByUsername(username).subscribe(user => {
          this.saleItem.user = user;
        });
      } catch {
        this.saleItem.user = null;
      }
    }

    // Map saleItems (which are Products) into SaleProduct model
    const soldProducts: SaleProduct[] = this.saleItems.map(product => {
      const discountAmount = (typeof product.discountAmount === 'number' && !isNaN(product.discountAmount))
        ? product.discountAmount
        : (product.discountPercentage || 0) / 100 * product.retailPrice * product.remainingQty;
      const discountedTotal = (product.retailPrice * product.remainingQty) - discountAmount;
      const saleProduct = new SaleProduct(
        product,
        product.remainingQty,
        discountedTotal,
        product.discountPercentage || 0,
        discountAmount,
        product.retailPrice
      );
      return saleProduct;
    });
    this.saleItem.soldProducts = soldProducts;
    this.saleItem.totalAmount = this.getTotal();
    this.saleItem.subTotal = this.getSubtotal();
    this.saleItem.billWiseDiscountPercentage = this.billWiseDiscountPercentage;
    // Attach vehicle and vehicleNumber to saleItem before sending
    this.saleItem.vehicle = this.selectedVehicle;
    this.saleItem.vehicleNumber = this.vehicleNumber;

    // Remove saleId before sending to backend
    if ('saleId' in this.saleItem) {
      delete (this.saleItem as any).saleId;
    }

    // Attach full customer and user objects
  // customer and user are already set on saleItem

    if (isHold) {
      // Save as hold sale directly, skip payment dialog
      this.saleItem.paidAmount = 0;
      this.saleItem.isFullyPaid = false;
      this.saleItem.paymentType = 'Hold';
      this.saleItem.isHold = true;
      this.loadingDialogRef = this.dialog.open(LoadingDialogComponent, {
        disableClose: true,
        panelClass: 'custom-loading-dialog'
      });
      this.saleService.createSale(this.saleItem).subscribe({
        next: response => {
          this.loadingDialogRef.close();
          if (response.statusCode == 201) {
            this.invoiceNumber = response.invoiceNumber;
            this.clearForm();
            // Removed getInvoiceNumber API call
            if (onHoldSaved) onHoldSaved();
          } else {
            this.openFailureDialog(response.message);
          }
        },
        error: error => {
          this.loadingDialogRef.close();
          const errorMessage = error.error || 'Unknown error occurred';
          this.openFailureDialog(errorMessage);
        }
      });
      return;
    } else {
      // Creating as a new sale, ensure isHold is false
      this.saleItem.isHold = false;

      // Open the payment dialog
      const dialogRef = this.dialog.open(PaymentDialogComponent, {
        width: '300px',
        data: { maxAmount: this.saleItem.totalAmount } // Pass total amount as max limit
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {
          // Update the saleItem with payment details
          this.saleItem.paidAmount = result.paymentAmount;
          this.saleItem.isFullyPaid = result.paymentAmount >= this.saleItem.totalAmount;
          this.saleItem.paymentType = result.paymentType;
          if (result.paymentType === 'Cheque') {
            this.saleItem.chequeNumber = result.chequeNumber;
            this.saleItem.bankName = result.bankName;
            this.saleItem.chequeDate = result.chequeDate;
          } else {
            this.saleItem.chequeNumber = undefined;
            this.saleItem.bankName = undefined;
            this.saleItem.chequeDate = undefined;
          }

          // Attach full customer and user objects again before sending
          // customer and user are already set on saleItem

          this.loadingDialogRef = this.dialog.open(LoadingDialogComponent, {
            disableClose: true,
            panelClass: 'custom-loading-dialog'
          });
          this.saleService.createSale(this.saleItem).subscribe({
            next: response => {
              this.loadingDialogRef.close();
              if (response.statusCode == 201) {
                this.invoiceNumber = response.invoiceNumber;
                // Call SMS API after sale creation
                this.saleService.sendSaleDetailsSms(response.saleId || response.id).subscribe();
                // Prepare invoice data for navigation
                const invoiceData = {
                  invoiceNumber: this.invoiceNumber,
                  currentDate: this.currentDate,
                  selectedCustomerName: this.selectedCustomerName,
                  loggedUserName: this.loggedUserName,
                  saleItems: this.saleItems,
                  billWiseDiscountPercentage: this.billWiseDiscountPercentage,
                  saleItem: this.saleItem,
                  vehicleNumber: this.vehicleNumber,
                  vehicle: this.selectedVehicle,
                  subtotal: this.getSubtotal(),
                  totalDiscount: this.getTotalDiscount(),
                  billWiseDiscountTotal: this.getTotalBillWiseDiscount(),
                  netTotal: this.getTotal()
                };
                console.log('Passing to invoice page:', {
                  vehicleNumber: this.vehicleNumber,
                  selectedVehicle: this.selectedVehicle,
                  invoiceData
                });
                this.router.navigate(['/invoice'], { state: { invoiceData } });
              } else {
                console.error('Error creating sale:', response.message);
                this.openFailureDialog(response.message);
              }
              this.clearForm();
              // Removed getInvoiceNumber API call
            },
            error: error => {
              this.loadingDialogRef.close();
              const errorMessage = error.error || 'Unknown error occurred';
              this.openFailureDialog(errorMessage);
            }
          });

        } else {
          console.log('Payment dialog closed without payment confirmation.');
        }
      });
    }

  }

  billWiseDiscountPercentage: number = 0; // Discount value (editable)
  lineWiseDiscountAmount: number = 0;

  // Method to calculate the subtotal
  getSubtotal(): number {
    const subTotal = this.saleItems.reduce((sum, item) => {
      const discountAmount = (item.discountPercentage || 0) / 100 * item.retailPrice * item.remainingQty;
      const discountedPrice = (item.retailPrice * item.remainingQty) - discountAmount;
      return sum + discountedPrice; // Add discounted price to the subtotal
    }, 0);

    this.saleItem.subTotal = subTotal; // Store the subtotal in saleItem
    return subTotal;
  }

  // Method to calculate the total (after applying discount)
  getTotal(): number {
    const subtotal = this.getSubtotal();
    const discountAmount = (this.billWiseDiscountPercentage || 0) / 100 * subtotal;
    const total = subtotal - discountAmount;
    this.saleItem.totalAmount = total; // Assign total to saleItem.totalAmount
    this.saleItem.billWiseDiscountTotalAmount = discountAmount; // Assign discount amount to saleItem
    return total; // Return total for display
  }

  // Function to calculate the discount amount
  calculateDiscount(item: any): void {
    if (item.discountPercentage != null) {
      const discount = (item.discountPercentage / 100) * item.retailPrice;
      item.discountAmount = discount;
    }
  }

  // Function to calculate the total discount amount
  getTotalDiscount(): number {
    // Calculate the total discount across all products
    this.lineWiseDiscountAmount = this.saleItems.reduce((totalDiscount, product) => {
      const discountAmount = (product.discountPercentage || 0) / 100 * product.retailPrice * product.remainingQty;
      return totalDiscount + discountAmount;
    }, 0);
    this.saleItem.lineWiseDiscountTotalAmount = this.lineWiseDiscountAmount;
    return this.lineWiseDiscountAmount;
  }

  getTotalBillWiseDiscount(): number {
    const subtotal = this.getSubtotal(); // Get current subtotal
    const totalDiscount = (this.billWiseDiscountPercentage / 100) * subtotal; // Calculate total discount
    return totalDiscount; // Return total discount for display
  }

  // Removed getInvoiceNumber method and API call

  openCustomerListPopup() {
    const dialogRef = this.dialog.open(PopupCustomerListComponent, {
      width: '800px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedCustomerName = result.name;
        this.saleItem.customer = result;
        console.log('The dialog was closed', result);
      }
    });
  }

  openProductListPopup() {
    const dialogRef = this.dialog.open(InventoryListComponent, {
      width: '800px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed', result);
      }
    });
  }

  // Open the Create Product dialog as a popup and optionally add the created product to sale
  openCreateProductPopup(): void {
    const dialogRef = this.dialog.open(CreateProductComponent, {
      width: '900px',
      disableClose: false
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      // If the create product dialog returned a product, or even if not, refresh products so the new product
      // will appear in the search dropdown immediately.
      if (result && result.product) {
        const newProd = result.product as any;
        // Ensure defaults
        newProd.batchNo = newProd.batchNo ?? '';
        newProd.remainingQty = 1;
        newProd.retailPrice = newProd.retailPrice ?? newProd.salePrice ?? 0;
        // add to saleItems (try to attach batches if possible)
        if (newProd.sku) {
          this.productService.getBatchNumbersForProduct(newProd.sku).subscribe(batches => {
            if (batches && batches.length > 0) {
              newProd.batchNo = batches[0].batchNumber;
              newProd.batch = batches[0];
              newProd.retailPrice = newProd.retailPrice || batches[0].retailPrice || batches[0].unitCost;
            }
            this.saleItems.push(newProd);
          }, err => {
            this.saleItems.push(newProd);
          });
        } else {
          this.saleItems.push(newProd);
        }
        // Add to products list and searchResults so it appears immediately
        try {
          const exists = this.products.find(p => (p.productId && newProd.productId && p.productId === newProd.productId) || (p.sku && newProd.sku && p.sku === newProd.sku));
          if (!exists) this.products.unshift(newProd);
          const term = (this.productSearchTerm || '').toLowerCase().trim();
          const matches = !term || (newProd.productName && newProd.productName.toLowerCase().includes(term)) || (newProd.sku && newProd.sku.toLowerCase().includes(term));
          if (matches) {
            const existsInSearch = this.searchResults.find(p => (p.productId && newProd.productId && p.productId === newProd.productId) || (p.sku && newProd.sku && p.sku === newProd.sku));
            if (!existsInSearch) this.searchResults.unshift(newProd);
          }
        } catch (e) {
          // ignore
        }
      }

      // Always refresh products list from server to ensure we have the latest data (covers cases where the
      // Create Product dialog didn't return the product object)
      this.productService.getAllProducts().subscribe((data: Product[] = []) => {
        this.products = data || [];
        if (this.productSearchTerm && this.productSearchTerm.trim().length > 0) {
          this.searchProduct();
        }
      }, err => {
        // ignore
      });
    });
  }

  // Open Create Purchase dialog as popup
  openCreatePurchasePopup(): void {
    const dialogRef = this.dialog.open(CreatePurchaseComponent, {
      width: '1000px',
      disableClose: false,
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If a purchase was created, you might want to refresh related data (suppliers/products)
        this.fetchCategories();
        this.productService.getAllProducts().subscribe((data: Product[]) => {
          this.products = data;
        });
      }
    });
  }

  // Function to clear the form and saleItems
  clearForm() {
    this.selectedBatch = null; // Clear the selected batch
    this.batchList = []; // Clear the batch list if needed
    this.saleQty = 0; // Reset quantity
    this.saleItems = [];          // Clear selected items
    this.selectedCustomerName = 'Select Customer'; // Reset customer name
    this.billWiseDiscountPercentage = 0; // Reset discount percentage
  }

  // Success dialog
  openSuccessDialog() {
    // Show success dialog
    const dialogRef = this.dialog.open(SuccessDialogComponent, {
      width: '300px',
      data: { message: 'Sale created successfully!' }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Only open bill dialog if showBillButton is not already set (to avoid double open)
      if (!this.showBillButton) {
        this.openBillDialog();
      }
      this.clearForm();
    });

  }

  openBillDialog() {
    this.dialog.open(BillDialogComponent, {
      width: '800px',
      data: {
        invoiceNumber: this.invoiceNumber,
        currentDate: this.currentDate,
        selectedCustomerName: this.selectedCustomerName,
        loggedUserName: this.loggedUserName,
        saleItems: this.saleItems,
        billWiseDiscountPercentage: this.billWiseDiscountPercentage,
        saleItem: this.saleItem,
        vehicleNumber: this.vehicleNumber,
        vehicle: this.selectedVehicle,
        getSubtotal: () => this.getSubtotal(),
        getTotalDiscount: () => this.getTotalDiscount(),
        getTotalBillWiseDiscount: () => this.getTotalBillWiseDiscount(),
        getTotal: () => this.getTotal()
      }
    });
    this.showBillButton = false;
  }

  // Failure dialog
  openFailureDialog(errorMessage: string) {
    this.dialog.open(FailureDialogComponent, {
      width: '300px',
      data: { message: errorMessage }
    });
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']); // Navigates to home (dashboard)
  }

  navigateToOrders(): void {
    this.router.navigate(['/orders']); // Navigates to orders list
  }

  openQuantityInputDialog(): void {
    const dialogRef = this.dialog.open(QuantityInputComponent, {
      width: '300px',
      data: { /* any data you want to pass */ }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        console.log('Quantity entered:', result); // Process the entered quantity
        // You can now use this result to add to the sale or any other logic
      }
    });
  }

  openBatchSelection(): void {
    const dialogRef = this.dialog.open(BatchSelectionComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result: Batch) => {
      if (result) {
        this.selectedBatch = result; // Set the selected batch from the dialog
        // You may also want to open the quantity input dialog here if needed
      }
    });
  }

  openDiscountModal(item: any): void {
    const dialogRef = this.dialog.open(DiscountInputComponent, {
      width: '400px', // Set the modal size
      data: {} // Pass any data if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        // Update the item's discountPercentage with the selected discount value
        item.discountPercentage = result;
        this.calculateDiscount(item); // Recalculate the discount for the item
      }
    });
  }

  openBillWiseDiscountModal(): void {
    const dialogRef = this.dialog.open(DiscountBillWiseComponent, {
      width: '400px', // Set the modal size
      data: {} // Pass any data if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        // Update the item's discountPercentage with the selected discount value
        this.billWiseDiscountPercentage = result;
        this.getTotalBillWiseDiscount(); // Recalculate the discount for the item
      }
    });
  }

  fetchCategories() {
    this.categoryService.getAllCategories().subscribe((data) => {
      this.categories = data;
    });
  }

  loadProducts(categoryId: string) {
    this.resetProductBoxSelection();
    this.productService.searchProductByCategory(categoryId).subscribe((data) => {
      this.products = data;
    });
  }

  addProductToSale(product: Product): void {
    // Reset product selection
    this.resetProductBoxSelection();

    this.selectedProduct = product;

    // Fetch batch list for the selected product
    this.productService.getBatchNumbersForProduct(product.sku).subscribe(
      (batches: Batch[]) => {
        this.batchList = batches;
        if (this.batchList.length === 1) {
          // If only one batch, auto-select and set default quantity as 1
          const selectedBatch = this.batchList[0];
          const quantityDialogRef = this.dialog.open(QuantityInputComponent, {
            width: '400px',
          });

          // After the quantity input dialog closes
          quantityDialogRef.afterClosed().subscribe((quantity: number) => {
            if (quantity && quantity > 0) {
              this.addProductToSaleItems(product, selectedBatch, quantity);
            } else {
              console.warn('No valid quantity entered.');
            }
          });

        } else {
          // Open batch selection dialog if multiple batches
          const batchDialogRef = this.dialog.open(BatchSelectionComponent, {
            width: '400px',
            data: { batchList: batches }
          });

          batchDialogRef.afterClosed().subscribe((selectedBatch: Batch) => {
            if (selectedBatch) {
              // After batch selection, open quantity dialog
              const quantityDialogRef = this.dialog.open(QuantityInputComponent, {
                width: '300px',
                data: { selectedBatch }
              });

              quantityDialogRef.afterClosed().subscribe((quantity: number) => {
                if (quantity && quantity > 0) {
                  this.addProductToSaleItems(product, selectedBatch, quantity);
                }
              });
            }
          });
        }
      },
      error => console.error('Error fetching batches:', error)
    );
    this.clearProducts(); // Clear products after adding to sale
  }

  private addProductToSaleItems(product: Product, selectedBatch: Batch, quantity: number): void {
    this.productService.getAvailableQuantity(product.sku, selectedBatch.batchNumber).subscribe(
      availableQty => {
        console.log("eeeeeeeeee", availableQty);
        // Check if requested quantity is available
        if (quantity <= 0 || quantity > availableQty) {
          this.openFailureDialog('Requested quantity exceeds available stock.'); // Show error dialog
          return; // Exit the method if quantity is invalid
        }

        // Check if the item with the selected batch already exists
        const existingItem = this.saleItems.find(
          item => item.productId === product.productId && item.batchNo === selectedBatch.batchNumber
        );

        if (existingItem) {
          // Update quantity if item exists
          existingItem.remainingQty += quantity;
        } else {
          // Add new item with batch and quantity to saleItems
          this.saleItems.push({
            ...product,
            batchNo: selectedBatch.batchNumber,
            remainingQty: quantity,
            retailPrice: selectedBatch.unitCost
          });
        }
      },
      error => {
        console.error('Error fetching available quantity:', error);
        this.openFailureDialog('Unable to check available quantity.'); // Handle error in fetching available quantity
      }
    );
  }

  private resetProductBoxSelection(): void {
    this.selectedProduct = null;  // Clear selected product
    this.selectedBatch = null;     // Clear selected batch
    this.saleQty = 1;              // Reset quantity to 1 (default)
    this.batchList = [];           // Clear the batch list
    this.productSearchTerm = '';    // Clear the search term
    this.searchResults = [];        // Clear search results if necessary
  }

  clearProducts(): void {
    this.products = []; // Clear the products array
    this.selectedProduct = null; // Clear the selected product
    this.selectedBatch = null; // Clear the selected batch
    this.saleQty = 1; // Reset quantity to 1 (default)
    this.batchList = []; // Clear the batch list
    this.productSearchTerm = ''; // Clear the search term if needed
    this.searchResults = []; // Clear search results if needed
  }

  // Go back to category list
  backToCategories() {
    this.showProducts = false; // Show categories
    this.products = []; // Clear products if needed
  }
}
