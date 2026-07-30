import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { format } from 'date-fns';

export interface BookingDialogData {
  checkIn: string | null;
  checkOut: string | null;
}

export interface BookingDialogResult {
  guestName: string;
  checkIn: string;
  checkOut: string;
}

@Component({
  selector: 'app-booking-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="modal-card">
      <!-- Accent Line -->
      <div class="status-bar"></div>

      <!-- Header -->
      <div class="modal-header">
        <div class="badge-icon">
          <mat-icon class="header-icon">add_business</mat-icon>
        </div>
        <div class="title-group">
          <h2 mat-dialog-title>Create New Booking</h2>
          <span class="subtitle">Enter reservation details for guest stay</span>
        </div>
      </div>

      <!-- Body -->
      <mat-dialog-content class="modal-body">
        <form [formGroup]="form" class="ss-form">
          <div class="field-container">
            <mat-form-field appearance="outline" class="ss-full-width custom-field">
              <mat-label>Guest Full Name</mat-label>
              <mat-icon matPrefix class="input-icon">person_outline</mat-icon>
              <input matInput formControlName="guestName" placeholder="e.g. Jordan Blake" />
              @if (form.controls.guestName.hasError('required')) {
                <mat-error>Guest name is required.</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="ss-date-row">
            <mat-form-field appearance="outline" class="custom-field">
              <mat-label>Check-in Date</mat-label>
              <input matInput [matDatepicker]="checkInPicker" formControlName="checkIn" />
              <mat-datepicker-toggle matIconSuffix [for]="checkInPicker"></mat-datepicker-toggle>
              <mat-datepicker #checkInPicker></mat-datepicker>
              @if (form.controls.checkIn.hasError('required')) {
                <mat-error>Required.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="custom-field">
              <mat-label>Check-out Date</mat-label>
              <input matInput [matDatepicker]="checkOutPicker" formControlName="checkOut" />
              <mat-datepicker-toggle matIconSuffix [for]="checkOutPicker"></mat-datepicker-toggle>
              <mat-datepicker #checkOutPicker></mat-datepicker>
              @if (form.controls.checkOut.hasError('required')) {
                <mat-error>Required.</mat-error>
              }
            </mat-form-field>
          </div>

          @if (form.errors?.['range']) {
            <div class="error-banner">
              <mat-icon class="error-icon">error_outline</mat-icon>
              <span>Check-out date must be strictly after check-in date.</span>
            </div>
          }

          <div class="info-card">
            <mat-icon class="info-icon">info_outline</mat-icon>
            <p class="ss-hint">
              Check-out day itself is not charged—the guest departs and property inventory releases on that night.
            </p>
          </div>
        </form>
      </mat-dialog-content>

      <!-- Footer Actions -->
      <mat-dialog-actions align="end" class="modal-actions">
        <button mat-button class="btn-cancel" (click)="dialogRef.close()">Cancel</button>
        <button 
          mat-flat-button 
          class="btn-submit"
          [disabled]="form.invalid" 
          (click)="save()">
          Create Booking
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }

      .modal-card {
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08);
      }

      .status-bar {
        height: 4px;
        width: 100%;
        background: linear-gradient(90deg, #2563eb, #3b82f6);
      }

      .modal-header {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 20px 20px 10px;
      }

      .badge-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: #eff6ff;
        color: #2563eb;
        flex-shrink: 0;
      }

      .header-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .title-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      h2[mat-dialog-title] {
        margin: 0 !important;
        padding: 0 !important;
        font-size: 1.2rem;
        font-weight: 700;
        color: #0f172a;
        letter-spacing: -0.01em;
      }

      .subtitle {
        font-size: 0.8rem;
        color: #64748b;
        font-weight: 400;
      }

      .modal-body {
        padding: 12px 20px 16px !important;
        margin: 0;
      }

      .ss-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 380px;
      }

      .ss-full-width {
        width: 100%;
      }

      .ss-date-row {
        display: flex;
        gap: 12px;
      }

      .ss-date-row mat-form-field {
        flex: 1;
      }

      .input-icon {
        color: #94a3b8;
        margin-right: 8px;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      ::ng-deep .custom-field .mat-mdc-text-field-wrapper {
        border-radius: 10px !important;
        background-color: #f8fafc !important;
      }

      ::ng-deep .custom-field .mdc-notched-outline__leading,
      ::ng-deep .custom-field .mdc-notched-outline__notch,
      ::ng-deep .custom-field .mdc-notched-outline__trailing {
        border-color: #cbd5e1 !important;
      }

      ::ng-deep .custom-field.mat-focused .mdc-notched-outline__leading,
      ::ng-deep .custom-field.mat-focused .mdc-notched-outline__notch,
      ::ng-deep .custom-field.mat-focused .mdc-notched-outline__trailing {
        border-color: #2563eb !important;
        border-width: 2px !important;
      }

      .error-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: #fff1f2;
        border: 1px solid #fecdd3;
        border-radius: 8px;
        color: #e11d48;
        font-size: 0.8rem;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .error-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .info-card {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 10px 12px;
        background: #f1f5f9;
        border-radius: 8px;
        margin-top: 4px;
      }

      .info-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #64748b;
        margin-top: 2px;
      }

      .ss-hint {
        font-size: 0.775rem;
        color: #475569;
        line-height: 1.4;
        margin: 0;
      }

      .modal-actions {
        padding: 14px 20px !important;
        margin: 0 !important;
        background: #f8fafc;
        border-top: 1px solid #f1f5f9;
        gap: 10px;
      }

      button {
        border-radius: 8px !important;
        font-weight: 600 !important;
        font-size: 0.85rem !important;
        padding: 0 20px !important;
        height: 40px !important;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      .btn-cancel {
        color: #64748b !important;
      }

      .btn-cancel:hover {
        background: #e2e8f0 !important;
        color: #0f172a !important;
      }

      .btn-submit {
        background: #2563eb !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      }

      .btn-submit:hover:not([disabled]) {
        background: #1d4ed8 !important;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
      }

      .btn-submit[disabled] {
        background: #94a3b8 !important;
        color: #ffffff !important;
        opacity: 0.6;
        box-shadow: none;
      }
    `
  ]
})
export class BookingDialogComponent {
  dialogRef = inject(MatDialogRef<BookingDialogComponent, BookingDialogResult | undefined>);
  data: BookingDialogData = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  form = this.fb.group(
    {
      guestName: this.fb.control('', { validators: [Validators.required] }),
      checkIn: this.fb.control<Date | null>(
        this.data.checkIn ? new Date(`${this.data.checkIn}T00:00:00`) : null,
        { validators: [Validators.required] }
      ),
      checkOut: this.fb.control<Date | null>(
        this.data.checkOut ? new Date(`${this.data.checkOut}T00:00:00`) : null,
        { validators: [Validators.required] }
      ),
    },
    { validators: [(group) => this.rangeValidator(group)] }
  );

  private rangeValidator(group: AbstractControl) {
    const checkIn = group.get('checkIn')?.value as Date | null;
    const checkOut = group.get('checkOut')?.value as Date | null;
    if (checkIn && checkOut && checkOut.getTime() <= checkIn.getTime()) {
      return { range: true };
    }
    return null;
  }

  save(): void {
    if (this.form.invalid) return;
    const { guestName, checkIn, checkOut } = this.form.getRawValue();
    this.dialogRef.close({
      guestName: (guestName ?? '').trim(),
      checkIn: format(checkIn as Date, 'yyyy-MM-dd'),
      checkOut: format(checkOut as Date, 'yyyy-MM-dd'),
    });
  }
}