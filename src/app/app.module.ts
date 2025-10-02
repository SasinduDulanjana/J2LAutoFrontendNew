import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { SalesReturnListComponent } from './views/sales-return-list/sales-return-list.component';
import { PurchaseReturnListComponent } from './views/purchase-return-list/purchase-return-list.component';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HashLocationStrategy, LocationStrategy } from '@angular/common'; // Remove duplicate PathLocationStrategy
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';

// Import routing module
import { AppRoutingModule } from './app-routing.module';

// Import app component
import { AppComponent } from './app.component';

// Import containers
import {
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent,
} from './containers';
import { BillComponent } from './bill/bill.component';
import { BillDialogComponent } from './bill/bill-dialog.component';

import {
  AvatarModule,
  BadgeModule,
  BreadcrumbModule,
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  DropdownModule,
  FooterModule,
  FormModule,
  GridModule,
  HeaderModule,
  ListGroupModule,
  NavModule,
  ProgressModule,
  SharedModule,
  SidebarModule,
  TabsModule,
  UtilitiesModule,
} from '@coreui/angular';

import { IconModule, IconSetService } from '@coreui/icons-angular';
import { CreateCustomerComponent } from './create-customer/create-customer.component';
import { CustomerService } from './services/customer.service';
import { SupplierService } from './services/supplier.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './loginPage/login.component';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './auth.guard';
import { AuthInterceptor } from './auth.interceptor';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { EditCustomerComponent } from './edit-customer/edit-customer.component';
import { CreateSupplierComponent } from './create-supplier/create-supplier.component';
import { EditSupplierComponent } from './edit-supplier/edit-supplier.component';
import { ProductListComponent } from './product-list/product-list.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { CreateProductComponent } from './create-product/create-product.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import { EditCategoryComponent } from './edit-category/edit-category.component';
import { CreateCategoryComponent } from './create-category/create-category.component';
import { CreatePurchaseComponent } from './create-purchase/create-purchase.component';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';
import { ViewProductsDialogComponent } from './purchase-list/view-products-dialog.component';
import { CreateSaleComponent } from './create-sale/create-sale.component';
import { SaleListComponent } from './sale-list/sale-list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import { PopupCustomerListComponent } from './popup-customer-list/popup-customer-list.component';
import { SuccessDialogComponent } from './success-dialog/success-dialog.component';
import { FailureDialogComponent } from './failure-dialog/failure-dialog.component';
import { QuantityInputComponent } from './quantity-input/quantity-input.component';
import { BatchSelectionComponent } from './batch-selection/batch-selection.component';
import { DiscountInputComponent } from './discount-input/discount-input.component';
import { DiscountBillWiseComponent } from './discount-bill-wise/discount-bill-wise.component';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DeletedSaleListComponent } from './deleted-sale-list/deleted-sale-list.component';
import { HoldSaleListComponent } from './hold-sale-list/hold-sale-list.component';
import { PartiallyPaidSaleListComponent } from './partially-paid-sale-list/partially-paid-sale-list.component';
import { ProductListPopupComponent } from './product-list-popup/product-list-popup.component';
import { RolesComponent } from './roles/roles.component';
import { UsersComponent } from './users/users.component';
import { SaleReportComponent } from './sale-report/sale-report.component';
import { PurchaseReportComponent } from './purchase-report/purchase-report.component';
import { InventoryReportComponent } from './inventory-report/inventory-report.component';
import { ProductReportComponent } from './product-report/product-report.component';
import { CustomerReportComponent } from './customer-report/customer-report.component';
import { SupplierReportComponent } from './supplier-report/supplier-report.component';
import { CustomerOutstandingReportComponent } from './customer-outstanding-report/customer-outstanding-report.component';
import { SupplierOutstandingReportComponent } from './supplier-outstanding-report/supplier-outstanding-report.component';
import { ChequeManagementComponent } from './cheque-management/cheque-management.component';
import { PaymentService } from './services/payment.service';
import { ProfitLossComponent } from './profit-loss/profit-loss.component';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { SalesReturnComponent } from './views/sales-return/sales-return.component';
import { PurchaseReturnComponent } from './views/purchase-return/purchase-return.component';
import { RolePermissionsComponent } from './role-permissions/role-permissions.component';
import { CustomerSaleViewComponent } from './customer-sale-view/customer-sale-view.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

const APP_CONTAINERS = [
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent,
];

@NgModule({
  declarations: [AppComponent, ...APP_CONTAINERS, CreateCustomerComponent, LoginComponent, CustomerListComponent, EditCustomerComponent, CreateSupplierComponent, EditSupplierComponent, SupplierListComponent, ProductListComponent, CategoryListComponent, CreateProductComponent, EditProductComponent, EditCategoryComponent, CreateCategoryComponent, CreatePurchaseComponent, PurchaseListComponent, ViewProductsDialogComponent, CreateSaleComponent, SaleListComponent, PopupCustomerListComponent, SuccessDialogComponent, FailureDialogComponent, QuantityInputComponent, BatchSelectionComponent, DiscountInputComponent, DiscountBillWiseComponent, PaymentDialogComponent, DeletedSaleListComponent, HoldSaleListComponent, PartiallyPaidSaleListComponent, ProductListPopupComponent, RolesComponent, UsersComponent, SaleReportComponent, PurchaseReportComponent, InventoryReportComponent, ProductReportComponent, CustomerReportComponent, SupplierReportComponent, ProfitLossComponent, SalesReturnComponent, PurchaseReturnComponent, SalesReturnListComponent, PurchaseReturnListComponent, RolePermissionsComponent, BillComponent, BillDialogComponent, InventoryListComponent, LoadingDialogComponent, CustomerOutstandingReportComponent, PaymentHistoryComponent, SupplierOutstandingReportComponent, ChequeManagementComponent, CustomerSaleViewComponent],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AvatarModule,
    BreadcrumbModule,
    FooterModule,
    DropdownModule,
    GridModule,
    HeaderModule,
    SidebarModule,
    IconModule,
    PerfectScrollbarModule,
    NavModule,
    ButtonModule,
    FormModule,
    UtilitiesModule,
    ButtonGroupModule,
    SharedModule,
    TabsModule,
    ListGroupModule,
    ProgressModule,
    BadgeModule,
    CardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor,
       multi: true 
    },
    IconSetService,
    Title,
    CustomerService,
    AuthService,
  AuthGuard,
  SupplierService,
  PaymentService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
