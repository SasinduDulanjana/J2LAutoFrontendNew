import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../models/category.model';
import { CategoryService } from '../services/category.service';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss']
})
export class EditCategoryComponent implements OnInit {
  loading: boolean = false;
  categoryId!: number;
  categories: Category[] = [];
  selectedParentCategoryId: number | undefined = 0;
  category: Category = new Category('', '');

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.categoryId = idParam ? +idParam : 0; // Handle null value
      if (this.categoryId) {
        this.categoryService.getCategoryById(this.categoryId).subscribe(data => {
          this.category = data;
          this.selectedParentCategoryId = data.parent;
          this.loading = false;
        }, error => {
          this.loading = false;
        });
      } else {
        this.loading = false;
        console.error('Invalid category ID');
      }
    });

    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    });
  }

  saveCategory(): void {
    this.loading = true;
    const updatedCategory = {
      name: this.category.name,
      catDesc: this.category.catDesc,
      catId: this.category.catId,
      parent: this.selectedParentCategoryId // Set the parentId to the selected category
    };

    this.categoryService.updateCategory(updatedCategory)
      .subscribe(response => {
        this.loading = false;
        this.dialog.open(SuccessDialogComponent, {
          data: { message: 'Category updated successfully!' }
        }).afterClosed().subscribe(() => {
          this.router.navigate(['/category-list']);
        });
      }, error => {
        this.loading = false;
        console.error('Error updating category:', error);
      });
  }
}

