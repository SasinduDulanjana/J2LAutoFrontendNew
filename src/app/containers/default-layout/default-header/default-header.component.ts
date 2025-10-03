import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ClassToggleService, HeaderComponent } from '@coreui/angular';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit, OnDestroy {

  @Input() sidebarId: string = "sidebar";

  public newMessages = new Array(4)
  public newTasks = new Array(5)
  public newNotifications = new Array(5)

  private clockInterval: any;

  constructor(
    private classToggler: ClassToggleService,
    private router: Router,
    private authService: AuthService
  ) {
    super();
  }
    goToPOS(): void {
      this.router.navigate(['/create-sale']);
    }
  logoutAndRedirect(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.startClock();
  }

  startClock() {
    this.clockInterval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      const clockElem = document.getElementById('realtime-clock');
      if (clockElem) {
        clockElem.textContent = timeString;
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }
}
