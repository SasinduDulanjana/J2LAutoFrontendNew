import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';
import { CategoryService } from '../services/category.service'; // Correct path to the service
import { Category } from '../models/category.model'; // Correct path to the model

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.scss']
})
export class CreateCategoryComponent implements OnInit{

  categories: Category[] = [];
  selectedParentCategoryId: number | undefined = 0;
  category: Category = new Category('', ''); // Initialize with empty values or defaults
  categoryNameExists: boolean = false;

  constructor(private categoryService: CategoryService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    });
  }
  
  createCategory(): void {
    if (this.categoryNameExists) {
      this.dialog.open(FailureDialogComponent, {
        width: '350px',
        data: { message: 'Category name already exists!' }
      });
      return;
    }
    const newCategory = {
      name: this.category.name,
      catDesc: this.category.catDesc,
      catId: this.category.catId,
      parent: this.selectedParentCategoryId // Set the parentId to the selected category
    };
    this.categoryService.createCategory(newCategory)
      .subscribe(response => {
        this.dialog.open(SuccessDialogComponent, {
          data: { message: 'Category created successfully!' }
        });
        // Optionally reset the form
        this.category = new Category('', '');
        this.selectedParentCategoryId = 0;
        // Refresh categories for parent dropdown
        this.categoryService.getAllCategories().subscribe(data => {
          this.categories = data;
        });
      }, error => {
        let errorMsg = 'Error creating category.';
        if (error && error.error && error.error.message) {
          errorMsg = error.error.message;
        }
        this.dialog.open(FailureDialogComponent, {
          width: '350px',
          data: { message: errorMsg }
        });
        console.error('Error creating category:', error);
      });
  }

  onCategoryNameChange(name: string): void {
    this.categoryNameExists = this.categories.some(cat => cat.name.trim().toLowerCase() === name.trim().toLowerCase());
  }

  openSuccessDialog(): void {
    const dialogRef = this.dialog.open(SuccessDialogComponent, {
      width: '250px',
      data: { message: 'Category created successfully!' }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
