import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { addDays, differenceInCalendarDays, format, isSameMonth, isToday } from 'date-fns';
import { finalize } from 'rxjs/operators';

import { ApiService, ApiError } from '../../core/services/api.service';
import { Booking, CalendarDay, Property } from '../../core/models/models';
import { buildMonthGrid, chunkIntoWeeks, toDateKey, WEEKDAY_LABELS } from './calendar-grid.util';
import { SetRateDialogComponent, SetRateDialogResult } from './dialogs/set-rate-dialog.component';
import { BlockDialogComponent } from './dialogs/block-dialog.component';
import { BookingDialogComponent, BookingDialogResult } from './dialogs/booking-dialog.component';

interface SelectionRange {
  start: string;
  end: string; 
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly weekdayLabels = WEEKDAY_LABELS;

  readonly property = signal<Property | null>(null);
  readonly monthAnchor = signal<Date>(new Date());
  readonly daysByKey = signal<Map<string, CalendarDay>>(new Map());
  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal<boolean>(true);
  readonly actionInProgress = signal<boolean>(false);

  readonly selectionRange = signal<SelectionRange | null>(null);
  private readonly selectionAnchor = signal<string | null>(null);

  readonly monthLabel = computed(() => format(this.monthAnchor(), 'MMMM yyyy'));

  readonly weeks = computed(() => chunkIntoWeeks(buildMonthGrid(this.monthAnchor())));

  readonly selectionNights = computed(() => {
    const range = this.selectionRange();
    if (!range) return 0;
    return differenceInCalendarDays(new Date(`${range.end}T00:00:00`), new Date(`${range.start}T00:00:00`)) + 1;
  });

  readonly selectionTotal = computed(() => {
    const range = this.selectionRange();
    if (!range) return 0;
    const map = this.daysByKey();
    let total = 0;
    let cursor = new Date(`${range.start}T00:00:00`);
    const end = new Date(`${range.end}T00:00:00`);
    while (cursor.getTime() <= end.getTime()) {
      const key = toDateKey(cursor);
      total += map.get(key)?.nightlyRate ?? this.property()?.baseRate ?? 0;
      cursor = addDays(cursor, 1);
    }
    return total;
  });

  readonly selectionLabel = computed(() => {
    const range = this.selectionRange();
    if (!range) return null;
    const start = new Date(`${range.start}T00:00:00`);
    const end = new Date(`${range.end}T00:00:00`);
    const startLabel = format(start, 'EEE, d MMM');
    const endLabel = format(end, 'EEE, d MMM yyyy');
    return `${startLabel} \u2192 ${endLabel}`;
  });

  readonly hasActiveSelection = computed(() => this.selectionRange() !== null);

  ngOnInit(): void {
    this.loadProperty();
    this.loadCalendar();
    this.loadBookings();
  }

  private loadProperty(): void {
    this.api.getProperty().subscribe({
      next: (property) => this.property.set(property),
      error: () => this.showError('Could not load property details.'),
    });
  }

  private loadBookings(): void {
    this.api.getBookings().subscribe({
      next: (bookings) => this.bookings.set(bookings),
      error: () => undefined,
    });
  }

  private loadCalendar(): void {
    const grid = buildMonthGrid(this.monthAnchor());
    const start = toDateKey(grid[0]);
    const end = toDateKey(grid[grid.length - 1]);
    this.loading.set(true);
    this.api
      .getCalendar(start, end)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          const map = new Map<string, CalendarDay>();
          for (const day of response.days) map.set(day.date, day);
          this.daysByKey.set(map);
        },
        error: () => this.showError('Could not load the calendar. Is the API running?'),
      });
  }

  private refreshAll(): void {
    this.loadCalendar();
    this.loadBookings();
  }

  prevMonth(): void {
    const d = this.monthAnchor();
    this.monthAnchor.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.loadCalendar();
  }

  nextMonth(): void {
    const d = this.monthAnchor();
    this.monthAnchor.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.loadCalendar();
  }

  goToday(): void {
    this.monthAnchor.set(new Date());
    this.loadCalendar();
  }

  
  dayInfo(day: Date): CalendarDay | undefined {
    return this.daysByKey().get(toDateKey(day));
  }

  isCurrentMonth(day: Date): boolean {
    return isSameMonth(day, this.monthAnchor());
  }

  isToday(day: Date): boolean {
    return isToday(day);
  }

  dayNumber(day: Date): number {
    return day.getDate();
  }

  isSelected(day: Date): boolean {
    const range = this.selectionRange();
    if (!range) return false;
    const key = toDateKey(day);
    return key >= range.start && key <= range.end;
  }

  isSelectionEdge(day: Date): 'start' | 'end' | null {
    const range = this.selectionRange();
    if (!range) return null;
    const key = toDateKey(day);
    if (key === range.start) return 'start';
    if (key === range.end) return 'end';
    return null;
  }

  guestInitials(name: string | null): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  }

  onDayClick(day: Date): void {
    const key = toDateKey(day);
    const anchor = this.selectionAnchor();

    if (!anchor) {
      this.selectionAnchor.set(key);
      this.selectionRange.set({ start: key, end: key });
      return;
    }

    const start = key < anchor ? key : anchor;
    const end = key < anchor ? anchor : key;
    this.selectionRange.set({ start, end });
    this.selectionAnchor.set(null);
  }

  clearSelection(): void {
    this.selectionRange.set(null);
    this.selectionAnchor.set(null);
  }

  openSetRate(): void {
    const range = this.selectionRange();
    if (!range) return;
    const exclusiveEnd = toDateKey(addDays(new Date(`${range.end}T00:00:00`), 1));
    const currentRate = this.selectionTotal() / Math.max(this.selectionNights(), 1);

    const ref = this.dialog.open(SetRateDialogComponent, {
      width: '420px',
      data: {
        startDate: range.start,
        endDate: exclusiveEnd,
        nightRange: `${this.selectionLabel()} \u00b7 ${this.selectionNights()} night(s)`,
        currentRate: Math.round(currentRate) || this.property()?.baseRate || 120,
      },
    });

    ref.afterClosed().subscribe((result: SetRateDialogResult | undefined) => {
      if (!result) return;
      this.actionInProgress.set(true);
      this.api
        .setRate(range.start, exclusiveEnd, result.nightlyRate)
        .pipe(finalize(() => this.actionInProgress.set(false)))
        .subscribe({
          next: () => {
            this.showSuccess('Rate updated for the selected nights.');
            this.clearSelection();
            this.refreshAll();
          },
          error: (err) => this.showError(this.friendlyMessage(err, 'Could not update the rate.')),
        });
    });
  }

  openBlock(): void {
    const range = this.selectionRange();
    if (!range) return;
    const exclusiveEnd = toDateKey(addDays(new Date(`${range.end}T00:00:00`), 1));

    const ref = this.dialog.open(BlockDialogComponent, {
      width: '420px',
      data: { mode: 'BLOCK', nightRange: `${this.selectionLabel()} \u00b7 ${this.selectionNights()} night(s)` },
    });

    ref.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (!confirmed) return;
      this.actionInProgress.set(true);
      this.api
        .blockDates(range.start, exclusiveEnd)
        .pipe(finalize(() => this.actionInProgress.set(false)))
        .subscribe({
          next: () => {
            this.showSuccess('Dates blocked.');
            this.clearSelection();
            this.refreshAll();
          },
          error: (err) => this.showError(this.friendlyMessage(err, 'Could not block those dates.')),
        });
    });
  }

  openUnblock(): void {
    const range = this.selectionRange();
    if (!range) return;
    const exclusiveEnd = toDateKey(addDays(new Date(`${range.end}T00:00:00`), 1));

    const ref = this.dialog.open(BlockDialogComponent, {
      width: '420px',
      data: { mode: 'UNBLOCK', nightRange: `${this.selectionLabel()} \u00b7 ${this.selectionNights()} night(s)` },
    });

    ref.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (!confirmed) return;
      this.actionInProgress.set(true);
      this.api
        .unblockDates(range.start, exclusiveEnd)
        .pipe(finalize(() => this.actionInProgress.set(false)))
        .subscribe({
          next: () => {
            this.showSuccess('Dates unblocked.');
            this.clearSelection();
            this.refreshAll();
          },
          error: (err) => this.showError(this.friendlyMessage(err, 'Could not unblock those dates.')),
        });
    });
  }

  openNewBooking(): void {
    const range = this.selectionRange();
    const exclusiveEnd = range ? toDateKey(addDays(new Date(`${range.end}T00:00:00`), 1)) : null;

    const ref = this.dialog.open(BookingDialogComponent, {
      width: '420px',
      data: { checkIn: range?.start ?? null, checkOut: exclusiveEnd },
    });

    ref.afterClosed().subscribe((result: BookingDialogResult | undefined) => {
      if (!result) return;
      this.actionInProgress.set(true);
      this.api
        .createBooking(result.guestName, result.checkIn, result.checkOut)
        .pipe(finalize(() => this.actionInProgress.set(false)))
        .subscribe({
          next: () => {
            this.showSuccess(`Booking created for ${result.guestName}.`);
            this.clearSelection();
            this.refreshAll();
          },
          error: (err) => this.showError(this.friendlyMessage(err, 'Could not create that booking.')),
        });
    });
  }

  runImport(): void {
    this.actionInProgress.set(true);
    this.api
      .importReservations()
      .pipe(finalize(() => this.actionInProgress.set(false)))
      .subscribe({
        next: (summary) => {
          this.showSuccess(
            `Import complete: ${summary.imported} imported, ${summary.cancelled} cancelled, ` +
              `${summary.duplicate} duplicate, ${summary.conflict} conflict.`
          );
          this.refreshAll();
        },
        error: (err) => this.showError(this.friendlyMessage(err, 'Import failed.')),
      });
  }    private friendlyMessage(err: unknown, fallback: string): string {
    if (err instanceof ApiError) return err.message || fallback;
    return fallback;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 4000, panelClass: 'ss-snackbar-success' });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 6000, panelClass: 'ss-snackbar-error' });
  }
}
