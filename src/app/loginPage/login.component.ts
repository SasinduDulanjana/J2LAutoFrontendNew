// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  login(): void {
    this.authService.login(this.username, this.password).subscribe(
      response => {
        if (response && response.token) {
        localStorage.setItem('token', response.token); // Adjust according to your API response
        this.router.navigate(['/dashboard']);
      }else {
        alert('Login failed: Token not received');
      }
    },
      error => {
        console.error('Error logging in:', error);
        alert('Invalid credentials');
      }
    );
  }
}
