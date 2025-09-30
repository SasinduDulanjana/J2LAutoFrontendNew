
import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../services/supplier.service';
import { Router } from '@angular/router';
import { Supplier } from '../models/supplier.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-supplier-report',
  templateUrl: './supplier-report.component.html',
  styleUrls: ['./supplier-report.component.scss']
})
export class SupplierReportComponent implements OnInit {
  suppliers: any[] = [];
  filteredSuppliers: any[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private supplierService: SupplierService, private router: Router) {}
  viewSupplierDetails(supplier: any): void {
    const id = supplier.supId ?? supplier.id;
    if (id) {
      this.router.navigate(['/supplier-outstanding-report', id]);
    }
  }

  ngOnInit(): void {
    this.fetchSuppliers();
  }

  fetchSuppliers(): void {
    this.loading = true;
    this.supplierService.findAllSuppliersWithOutstanding().subscribe({
      next: (data: any[]) => {
        this.suppliers = data;
        this.filteredSuppliers = data;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to fetch suppliers.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredSuppliers = this.suppliers.filter(supplier =>
        (supplier.name && supplier.name.toLowerCase().includes(query)) ||
        (supplier.phone && supplier.phone.toLowerCase().includes(query))
      );
    } else {
      this.filteredSuppliers = this.suppliers;
    }
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Supplier Report', 14, 16);
    const head = [[
      'Name',
      'Phone',
      'Email',
      'Address',
      'Total Purchases',
      'Outstanding'
    ]];
    const data = (this.filteredSuppliers || []).map((supplier: any) => [
      supplier.name || '',
      supplier.phone || '',
      supplier.email || '',
      supplier.address || '',
      supplier.totalPurchases != null ? supplier.totalPurchases.toFixed(2) : '',
      supplier.outstanding != null ? supplier.outstanding.toFixed(2) : ''
    ]);
    autoTable(doc, {
      head,
      body: data,
      startY: 22,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210] },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      margin: { left: 8, right: 8 }
    });
    doc.save('supplier-report.pdf');
  }
}
