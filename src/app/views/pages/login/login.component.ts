import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService) { }

  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        // Optionally handle JSESSIONID from Set-Cookie header
      },
      error: (err) => {
        alert('Login failed: ' + (err.error?.message || 'Invalid credentials or server error.'));
      }
    });
  }
}
