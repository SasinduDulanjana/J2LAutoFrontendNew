import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../base-url';

export interface Feature {
  id: number;
  featureName: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class FeatureService {
  private apiUrl = BASE_URL + '/features';

  constructor(private http: HttpClient) {}

  getFeatures(): Observable<Feature[]> {
    return this.http.get<Feature[]>(this.apiUrl);
  }
}
