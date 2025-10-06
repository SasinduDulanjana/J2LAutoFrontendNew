import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { SalesReturnListComponent } from './views/sales-return-list/sales-return-list.component';
import { PurchaseReturnListComponent } from './views/purchase-return-list/purchase-return-list.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DefaultLayoutComponent } from './containers';
import { Page404Component } from './views/pages/page404/page404.component';
import { Page500Component } from './views/pages/page500/page500.component';
import { LoginComponent } from './loginPage/login.component';
import { RegisterComponent } from './views/pages/register/register.component';
import { CreateCustomerComponent } from './create-customer/create-customer.component';
import { AuthGuard } from './auth.guard';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { EditCustomerComponent } from './edit-customer/edit-customer.component';
import { CreateSupplierComponent } from './create-supplier/create-supplier.component';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { EditSupplierComponent } from './edit-supplier/edit-supplier.component';
import { CreateProductComponent } from './create-product/create-product.component';
import { ProductListComponent } from './product-list/product-list.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import { CreateCategoryComponent } from './create-category/create-category.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { EditCategoryComponent } from './edit-category/edit-category.component';
import { CreatePurchaseComponent } from './create-purchase/create-purchase.component';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';
import { CreateSaleComponent } from './create-sale/create-sale.component';
import { SaleListComponent } from './sale-list/sale-list.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { DeletedSaleListComponent } from './deleted-sale-list/deleted-sale-list.component';
import { HoldSaleListComponent } from './hold-sale-list/hold-sale-list.component';
import { PartiallyPaidSaleListComponent } from './partially-paid-sale-list/partially-paid-sale-list.component';
import { RolesComponent } from './roles/roles.component';
import { UsersComponent } from './users/users.component';
import { SaleReportComponent } from './sale-report/sale-report.component';
import { PurchaseReportComponent } from './purchase-report/purchase-report.component';
import { InventoryReportComponent } from './inventory-report/inventory-report.component';
import { ProductReportComponent } from './product-report/product-report.component';
import { CustomerReportComponent } from './customer-report/customer-report.component';
import { CustomerOutstandingReportComponent } from './customer-outstanding-report/customer-outstanding-report.component';
import { SupplierOutstandingReportComponent } from './supplier-outstanding-report/supplier-outstanding-report.component';
import { ChequeManagementComponent } from './cheque-management/cheque-management.component';
import { SupplierReportComponent } from './supplier-report/supplier-report.component';
import { ProfitLossComponent } from './profit-loss/profit-loss.component';
import { SalesReturnComponent } from './views/sales-return/sales-return.component';
import { PurchaseReturnComponent } from './views/purchase-return/purchase-return.component';
import { RolePermissionsComponent } from './role-permissions/role-permissions.component';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { CustomerSaleViewComponent } from './customer-sale-view/customer-sale-view.component';
import { CreateExpenseComponent } from './create-expense/create-expense.component';
import { ExpenseListComponent } from './expense-list/expense-list.component';
// ...existing code...

const routes: Routes = [
  // Public customer sale view route (standalone, no admin layout)
  { path: 'public/sale/:id', component: CustomerSaleViewComponent },

  // Admin routes (protected, with layout)
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard], // Protect these routes
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'payment-history/:id',
        component: PaymentHistoryComponent,
        data: { title: 'Payment History' }
      },
      {
        path: 'inventory-list',
        component: InventoryListComponent,
        data: { title: 'Inventory List' }
      },
      {
        path: 'create-expense',
        component: CreateExpenseComponent,
        data: { title: 'Expenses' }
      },
      {
        path: 'expense-list',
        component: ExpenseListComponent,
        data: { title: 'Expense List' }
      },
      {
        path: 'purchase-invoice',
        loadChildren: () => import('./purchase-invoice-page/purchase-invoice-page.module').then(m => m.PurchaseInvoicePageModule),
        data: { title: 'Purchase Invoice' }
      },
      {
        path: 'invoice',
        loadChildren: () => import('./invoice-page/invoice-page.module').then(m => m.InvoicePageModule),
        data: { title: 'Sale Invoice' }
      },
      {
        path: 'role-permissions',
        component: RolePermissionsComponent,
        data: { title: 'Role Permissions' }
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/dashboard.module').then((m) => m.DashboardModule)
      },
      {
        path: 'sales-return-list',
        component: SalesReturnListComponent,
        data: {
          title: 'Sales Return List'
        }
      },
      {
        path: 'purchase-return-list',
        component: PurchaseReturnListComponent,
        data: {
          title: 'Purchase Return List'
        }
      },
      {
        path: 'create-customer',
        component: CreateCustomerComponent,
        data: {
          title: 'Create Customer'
        }
      },
      {
        path: 'customer-list',
        component: CustomerListComponent,
        data: {
          title: 'Customer List'
        }
      },
        {
          path: 'customer-outstanding-report/:id',
          component: CustomerOutstandingReportComponent,
          data: {
            title: 'Customer Outstanding Report'
          }
        },
        {
          path: 'supplier-outstanding-report/:id',
          component: SupplierOutstandingReportComponent,
          data: {
            title: 'Supplier Outstanding Report'
          }
        },
      {
        path: 'edit-customer/:custId',
        component: EditCustomerComponent,
        data: {
          title: 'Edit Customer'
        }
      },
      {
        path: 'create-supplier',
        component: CreateSupplierComponent,
        data: {
          title: 'Create Supplier'
        }
      },
      {
        path: 'supplier-list',
        component: SupplierListComponent,
        data: {
          title: 'Supplier List'
        }
      },
      {
        path: 'edit-supplier/:id',
        component: EditSupplierComponent,
        data: {
          title: 'Edit Supplier'
        }
      },
      {
        path: 'product-list',
        component: ProductListComponent,
        data: {
          title: 'Product List'
        }
      },
      {
        path: 'create-product',
        component: CreateProductComponent,
        data: {
          title: 'Create Product'
        }
      },
      {
        path: 'edit-product/:id',
        component: EditProductComponent,
        data: {
          title: 'Edit Product'
        }
      },
      {
        path: 'category-list',
        component: CategoryListComponent,
        data: {
          title: 'Category List'
        }
      },
      {
        path: 'create-category',
        component: CreateCategoryComponent,
        data: {
          title: 'Create Category'
        }
      },
      {
        path: 'edit-category/:id',
        component: EditCategoryComponent,
        data: {
          title: 'Edit Category'
        }
      },
      {
        path: 'create-purchase',
        component: CreatePurchaseComponent,
        data: {
          title: 'Create Purchase'
        }
      },
      {
        path: 'purchase-list',
        component: PurchaseListComponent,
        data: {
          title: 'Purchase List'
        }
      },
      {
        path: 'sale-list',
        component: SaleListComponent,
        data: {
          title: 'Sale List'
        }
      },
      {
        path: 'deleted-sale-list',
        component: DeletedSaleListComponent,
        data: {
          title: 'Deleted Sales'
        }
      },
      {
        path: 'hold-sale-list',
        component: HoldSaleListComponent,
        data: {
          title: 'Hold Sales'
        }
      },
      {
        path: 'partiallyPaid-sale-list',
        component: PartiallyPaidSaleListComponent,
        data: {
          title: 'Unpaid Sales'
        }
      },
      {
        path: 'orders',
        component: SaleListComponent,
        data: {
          title: 'Orders'
        }
      },
      {
        path: 'roles',
        component: RolesComponent,
        data: {
          title: 'Roles'
        }
      },
      {
        path: 'users',
        component: UsersComponent,
        data: {
          title: 'Users'
        }
      },
      {
        path: 'sale-report',
        component: SaleReportComponent,
        data: {
          title: 'Sale Report'
        }
      },
      {
        path: 'purchase-report',
        component: PurchaseReportComponent,
        data: {
          title: 'Purchase Report'
        }
      },
      {
        path: 'inventory-report',
        component: InventoryReportComponent,
        data: {
          title: 'Inventory Report'
        }
      },
      {
        path: 'product-report',
        component: ProductReportComponent,
        data: {
          // title: 'Product Report'
        }
      },
      {
        path: 'customer-report',
        component: CustomerReportComponent,
        data: {
          title: 'Customer Report'
        }
      },
      {
        path: 'supplier-report',
        component: SupplierReportComponent,
        data: {
          title: 'Supplier Report'
        }
      },
      {
        path: 'profit-loss',
        component: ProfitLossComponent,
        data: {
          title: 'Profit and Loss'
        }
      },
        {
          path: 'cheque-management',
          component: ChequeManagementComponent,
          data: {
            title: 'Cheque Management'
          }
        },
      {
        path: 'sales-return',
        component: SalesReturnComponent,
        data: {
          title: 'Sales Return'
        }
      },
      {
        path: 'purchase-return',
        component: PurchaseReturnComponent,
        data: {
          title: 'Purchase Return'
        }
      },
      {
        path: 'theme',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule)
      },
      {
        path: 'base',
        loadChildren: () =>
          import('./views/base/base.module').then((m) => m.BaseModule)
      },
      {
        path: 'buttons',
        loadChildren: () =>
          import('./views/buttons/buttons.module').then((m) => m.ButtonsModule)
      },
      {
        path: 'forms',
        loadChildren: () =>
          import('./views/forms/forms.module').then((m) => m.CoreUIFormsModule)
      },
      {
        path: 'charts',
        loadChildren: () =>
          import('./views/charts/charts.module').then((m) => m.ChartsModule)
      },
      {
        path: 'icons',
        loadChildren: () =>
          import('./views/icons/icons.module').then((m) => m.IconsModule)
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./views/notifications/notifications.module').then((m) => m.NotificationsModule)
      },
      {
        path: 'widgets',
        loadChildren: () =>
          import('./views/widgets/widgets.module').then((m) => m.WidgetsModule)
      },
      {
        path: 'pages',
        loadChildren: () =>
          import('./views/pages/pages.module').then((m) => m.PagesModule)
      },
      {
        path: 'purchase-payment-details/:id',
        loadChildren: () => import('./purchase-payment-details/purchase-payment-details.module').then(m => m.PurchasePaymentDetailsModule),
        data: { title: 'Purchase Payment Details' }
      },
    ]
  },
  {
    path: '404',
    component: Page404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: Page500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  { path: '**', redirectTo: 'dashboard' }
];
// ...existing code...
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
      initialNavigation: 'enabledBlocking'
      // relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
