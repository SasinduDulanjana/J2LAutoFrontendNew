import { INavData } from '@coreui/angular';
import { INavDataWithRoles } from './_nav-roles';

export const navItems: INavDataWithRoles[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'NEW'
    }
  },
  {
    name: 'Sale',
    url: '/sale',
    iconComponent: { name: 'cil-dollar' },
    feature: 'sale',
    children: [
      {
        name: 'Create Sale',
        url: '/create-sale'
      },
      {
        name: 'Sale List',
        url: '/sale-list'
      },
  // Deleted Sales removed
  // {
  //   name: 'Hold Sales',
  //   url: '/hold-sale-list'
  // },
  // Unpaid Sales removed
    ]
  },
  {
    name: 'Customer',
    url: '/customer',
    feature: 'customer',
    iconComponent: { name: 'cil-user' },

    children: [
      {
        name: 'Create Customer',
        url: '/create-customer',
        class: 'with-bullet'
      },
      {
        name: 'Customer List',
        url: '/customer-list',
        class: 'with-bullet'
      }
    ]
  },
  {
    name: 'Supplier',
    url: '/supplier',
    iconComponent: { name: 'cil-people' },
    feature: 'viewSupplierList',
    children: [
      {
        name: 'Create Supplier',
        url: '/create-supplier',
        feature: 'createSupplier'
      },
      {
        name: 'Supplier List',
        url: '/supplier-list',
        feature: 'viewSupplierList'
      }
    ]
  },
  {
    name: 'Inventory',
    url: '/inventory',
    iconComponent: { name: 'cil-layers' },
    feature: 'inventory',
    children: [
      {
        name: 'Product List',
        url: '/product-list'
      },
      {
        name: 'Create Product',
        url: '/create-product'
      },
      {
        name: 'Category List',
        url: '/category-list'
      },
      {
        name: 'Create Category',
        url: '/create-category'
      },
      {
        name: 'Inventory List',
        url: '/inventory-list'
      }
    ]
  },
  {
    name: 'Purchase',
    url: '/purchase',
    iconComponent: { name: 'cil-basket' },
    feature: 'purchase',
    children: [
      {
        name: 'Create Purchase',
        url: '/create-purchase'
      },
      {
        name: 'Purchase List',
        url: '/purchase-list'
      }
    ]
  },
  {
    name: 'Sales Return',
    iconComponent: { name: 'cil-share' },
    feature: 'salesReturn',
    url: '/sales-return'
  },
  {
    name: 'Purchase Return',
    iconComponent: { name: 'cil-chevron-left' }, // Changed to chevron left icon (confirmed available)
    feature: 'purchaseReturn',
    url: '/purchase-return'
  },
  {
    name: 'User Management',
    iconComponent: { name: 'cil-people' },
    feature: 'userManagement',
    children: [
      {
        name: 'Roles',
        url: '/roles',
        feature: 'rolesPage'
      },
      {
        name: 'Users',
        url: '/users',
        feature: 'usersPage'
      }
      ,
      {
        name: 'Role Permissions',
        url: '/role-permissions',
        feature: 'rolePermissionsPage'
      }
    ]
  },
  {
    name: 'Reports',
    iconComponent: { name: 'cil-chart-pie' },
    feature: 'reports',
    children: [
      {
        name: 'Sale Report',
        url: '/sale-report'
      },
      {
        name: 'Purchase Report',
        url: '/purchase-report'
      },
      {
        name: 'Inventory Report',
        url: '/inventory-report'
      },

      {
        name: 'Customer Report',
        url: '/customer-report'
      },
      {
        name: 'Supplier Report',
        url: '/supplier-report'
      },
      {
        name: 'Profit and Loss',
        url: '/profit-loss'
      }
    ]
  },
];
