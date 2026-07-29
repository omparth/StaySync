import { Injectable } from '@angular/core';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { from, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApiErrorPayload,
  Booking,
  CalendarResponse,
  ImportSummary,
  Property,
} from '../models/models';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http: AxiosInstance = axios.create({
    baseURL: environment.apiBaseUrl,
    timeout: 15000,
  });

  getProperty(): Observable<Property> {
    return this.request(this.http.get<Property>('/property'));
  }

  getCalendar(start: string, end: string): Observable<CalendarResponse> {
    return this.request(
      this.http.get<CalendarResponse>('/calendar', { params: { start, end } })
    );
  }

  setRate(startDate: string, endDate: string, nightlyRate: number): Observable<unknown> {
    return this.request(this.http.post('/rates', { startDate, endDate, nightlyRate }));
  }

  blockDates(startDate: string, endDate: string): Observable<unknown> {
    return this.request(this.http.post('/block', { startDate, endDate }));
  }

  unblockDates(startDate: string, endDate: string): Observable<unknown> {
    return this.request(
      this.http.delete('/block', { data: { startDate, endDate } })
    );
  }

  getBookings(): Observable<Booking[]> {
    return this.request(this.http.get<Booking[]>('/bookings'));
  }

  createBooking(guestName: string, checkIn: string, checkOut: string): Observable<Booking> {
    return this.request(
      this.http.post<Booking>('/bookings', { guestName, checkIn, checkOut, source: 'MANUAL' })
    );
  }

  importReservations(): Observable<ImportSummary> {
    return this.request(this.http.post<ImportSummary>('/import', {}));
  }

  private request<T>(promise: Promise<{ data: T }>): Observable<T> {
    return from(promise.then((res) => res.data)).pipe(
      catchError((err: AxiosError<ApiErrorPayload>) => {
        const status = err.response?.status ?? 0;
        const message =
          err.response?.data?.message ?? err.message ?? 'Something went wrong. Please try again.';
        return throwError(() => new ApiError(message, status, err.response?.data?.details));
      })
    );
  }
}
