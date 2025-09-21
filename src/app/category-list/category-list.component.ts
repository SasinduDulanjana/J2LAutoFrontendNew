import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { Router } from '@angular/router'; // Import Router
import { CreateCategoryComponent } from '../create-category/create-category.component';
import { MatDialog } from '@angular/material/dialog';
import { Category } from '../models/category.model';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {

  categories: any[] = [];
  filteredCategories: any[] = [];
  searchQuery: string = '';
  // selectedCategories: number[] = []; // Array to store selected category IDs
  selectedCategory: number | null = null;
  selectAll: boolean = false;
  parentNames: { [key: number]: string } = {}; // Store fetched parent names

  constructor(private categoryService: CategoryService, private router: Router, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
      this.filteredCategories = data;
    });
  }

  //Filter values from Table
  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredCategories = this.categories.filter(category =>
        category.name.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.filteredCategories = this.categories;
    }
  }

  // onSelect(categoryId: number): void {
  //   // const index = this.selectedCategories.indexOf(categoryId);
  //   // if (index > -1) {
  //   //   this.selectedCategories.splice(index, 1);
  //   // } else {
  //   //   this.selectedCategories.push(categoryId);
  //   // }
  //   if (this.selectedCategory === categoryId) {
  //     this.selectedCategory = null; // Deselect if the same checkbox is clicked again
  //   } else {
  //     this.selectedCategory = categoryId; // Select the new category
  //   }
  // }

  // onSelectAll(): void {
  //   // if (this.selectAll) {
  //   //   this.selectedCategories = this.filteredCategories.map(category => category.id);
  //   // } else {
  //   //   this.selectedCategories = [];
  //   // }
  // }

  // isSelected(categoryId: number): boolean {
  //   // return this.selectedCategories.includes(categoryId);
  //   return this.selectedCategory === categoryId;
  // }

  // deleteSelected(): void {
    // if (confirm('Are you sure you want to delete the selected categories?')) {
    //   // Call the service to delete selected categories
    //   this.categoryService.deleteCategories(this.selectedCategories).subscribe(
    //     () => {
    //       // Remove deleted categories from the list
    //       this.categories = this.categories.filter(category =>
    //         !this.selectedCategories.includes(category.id)
    //       );
    //       this.filteredCategories = this.filteredCategories.filter(category=>
    //         !this.selectedCategories.includes(category.id)
    //       );
    //       this.selectedCategories = [];
    //       this.selectAll = false;
    //     },
    //     error => {
    //       console.error('Error deleting categories', error);
    //     }
    //   );
    // }
  // }

  deleteCategory(category: Category): void {
    const dialogRef = this.dialog.open(FailureDialogComponent, {
      data: { confirm: true }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.categoryService.deleteCategory(category).subscribe(
          () => {
            this.dialog.open(SuccessDialogComponent, {
              data: { message: 'Category deleted successfully!' }
            });
            this.categoryService.getAllCategories().subscribe(
              (activeCategories: Category[]) => {
                this.categories = activeCategories;
                this.filteredCategories = activeCategories;
              },
              error => {
                console.error('Error fetching active categories:', error);
              }
            );
          },
          error => {
            console.error('Error deleting category', error);
          }
        );
      }
    });
  }

  editCategory(category: any): void {
    console.log('Category:', category);
    if (category?.catId) {
      this.router.navigate(['/edit-category', category.catId]);
    } else {
      console.error('Category ID is undefined or null.');
    }
  }

  getParentName(parentId: number | null): string {
    if (!parentId) {
      return 'No Parent';
    }
    if (this.parentNames[parentId]) {
      return this.parentNames[parentId];
    }
    this.categoryService.getCategoryById(parentId).subscribe(
      parentCategory => {
        this.parentNames[parentId] = parentCategory.name;
      },
      error => {
        console.error('Error fetching parent category:', error);
        this.parentNames[parentId] = 'Unknown Parent';
      }
    );
    return 'Loading...';
  }

  openCreateCategoryPopup() {
    const dialogRef = this.dialog.open(CreateCategoryComponent, {
      width: '800px', // Adjust the width as needed
      data: {} // You can pass data to the dialog here if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed', result);
      }
    });
  }

  navigateToCreateCategory() {
    this.router.navigate(['/create-category']);
  }
}
