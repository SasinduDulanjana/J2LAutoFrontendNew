// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginFailureDialogComponent } from './login-failure-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router, private dialog: MatDialog) { }

  login(): void {
    this.authService.login(this.username, this.password).subscribe(
      response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        } else {
          this.dialog.open(LoginFailureDialogComponent, {
            data: { message: 'Login failed: Token not received' },
            panelClass: 'modern-failure-dialog'
          });
        }
      },
      error => {
        console.error('Error logging in:', error);
        this.dialog.open(LoginFailureDialogComponent, {
          data: { message: 'Invalid username or password' },
          panelClass: 'modern-failure-dialog'
        });
      }
    );
  }
}
