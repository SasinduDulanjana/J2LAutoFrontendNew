import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SaleListStateService {
  private searchQuery: string = '';
  private filteredSales: any[] = [];
  private currentPage: number = 0;
  private isSearching: boolean = false;
  private allSalesData: any[] = [];
  private totalPages: number = 0;
  private totalCount: number = 0;

  constructor() {}

  saveState(
    searchQuery: string,
    filteredSales: any[],
    currentPage: number,
    isSearching: boolean,
    allSalesData: any[],
    totalPages: number,
    totalCount: number
  ): void {
    this.searchQuery = searchQuery;
    this.filteredSales = [...filteredSales];
    this.currentPage = currentPage;
    this.isSearching = isSearching;
    this.allSalesData = [...allSalesData];
    this.totalPages = totalPages;
    this.totalCount = totalCount;
  }

  getState() {
    return {
      searchQuery: this.searchQuery,
      filteredSales: this.filteredSales,
      currentPage: this.currentPage,
      isSearching: this.isSearching,
      allSalesData: this.allSalesData,
      totalPages: this.totalPages,
      totalCount: this.totalCount
    };
  }

  hasState(): boolean {
    return this.isSearching || this.searchQuery.trim().length > 0;
  }

  clearState(): void {
    this.searchQuery = '';
    this.filteredSales = [];
    this.currentPage = 0;
    this.isSearching = false;
    this.allSalesData = [];
    this.totalPages = 0;
    this.totalCount = 0;
  }
}
