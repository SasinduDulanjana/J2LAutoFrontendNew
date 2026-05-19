import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PurchaseListStateService {
  private searchQuery: string = '';
  private filteredPurchases: any[] = [];
  private currentPage: number = 0;
  private isSearching: boolean = false;
  private allPurchasesData: any[] = [];
  private totalPages: number = 0;
  private totalCount: number = 0;
  private suppliers: any[] = [];

  constructor() {}

  saveState(
    searchQuery: string,
    filteredPurchases: any[],
    currentPage: number,
    isSearching: boolean,
    allPurchasesData: any[],
    totalPages: number,
    totalCount: number,
    suppliers: any[]
  ): void {
    this.searchQuery = searchQuery;
    this.filteredPurchases = [...filteredPurchases];
    this.currentPage = currentPage;
    this.isSearching = isSearching;
    this.allPurchasesData = [...allPurchasesData];
    this.totalPages = totalPages;
    this.totalCount = totalCount;
    this.suppliers = [...suppliers];
  }

  getState() {
    return {
      searchQuery: this.searchQuery,
      filteredPurchases: this.filteredPurchases,
      currentPage: this.currentPage,
      isSearching: this.isSearching,
      allPurchasesData: this.allPurchasesData,
      totalPages: this.totalPages,
      totalCount: this.totalCount,
      suppliers: this.suppliers
    };
  }

  hasState(): boolean {
    return this.isSearching || this.searchQuery.trim().length > 0;
  }

  clearState(): void {
    this.searchQuery = '';
    this.filteredPurchases = [];
    this.currentPage = 0;
    this.isSearching = false;
    this.allPurchasesData = [];
    this.totalPages = 0;
    this.totalCount = 0;
    this.suppliers = [];
  }
}
