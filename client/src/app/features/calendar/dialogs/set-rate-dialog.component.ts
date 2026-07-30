import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export interface SetRateDialogData {
  startDate: string;
  endDate: string; 
  nightRange: string;
  currentRate: number;
}

export interface SetRateDialogResult {
  nightlyRate: number;
}

@Component({
  selector: 'app-set-rate-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <div class="modal-card">
      <!-- Status Indicator Line -->
      <div class="status-bar"></div>

      <!-- Header Section -->
      <div class="modal-header">
        <div class="badge-icon">
          <mat-icon class="header-icon">sell</mat-icon>
        </div>
        <div class="title-group">
          <h2 mat-dialog-title>Set Custom Nightly Rate</h2>
          <div class="date-chip">
            <mat-icon class="chip-icon">calendar_today</mat-icon>
            <span>{{ data.nightRange }}</span>
          </div>
        </div>
      </div>

      <!-- Dialog Body -->
      <mat-dialog-content class="modal-body">
        <div class="info-card">
          <mat-icon class="info-icon">bolt</mat-icon>
          <p class="ss-hint">
            This custom rate override will strictly supersede standard weekend and seasonal pricing for the selected nights.
          </p>
        </div>

        <mat-form-field appearance="outline" class="ss-full-width custom-field">
          <mat-label>Nightly Rate</mat-label>
          <span matTextPrefix class="currency-prefix">£&nbsp;</span>
          <input
            matInput
            type="number"
            min="1"
            step="1"
            [formControl]="rateControl"
            (keydown.enter)="save()"
            placeholder="0.00"
          />
          @if (rateControl.hasError('required')) {
            <mat-error>A nightly rate is required.</mat-error>
          }
          @if (rateControl.hasError('min')) {
            <mat-error>Rate must be greater than £0.</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>

      <!-- Action Buttons -->
      <mat-dialog-actions align="end" class="modal-actions">
        <button mat-button class="btn-cancel" (click)="dialogRef.close()">
          Cancel
        </button>
        <button 
          mat-flat-button 
          class="btn-submit" 
          [disabled]="rateControl.invalid" 
          (click)="save()">
          Update Rate
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
        gap: 6px;
      }

      h2[mat-dialog-title] {
        margin: 0 !important;
        padding: 0 !important;
        font-size: 1.15rem;
        font-weight: 700;
        color: #0f172a;
        letter-spacing: -0.01em;
      }

      .date-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 10px;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 0.775rem;
        font-weight: 600;
        color: #475569;
        width: fit-content;
      }

      .chip-icon {
        font-size: 13px;
        width: 13px;
        height: 13px;
        color: #2563eb;
      }

      .modal-body {
        padding: 12px 20px 20px !important;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .info-card {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 12px;
        background: #f8fafc;
        border: 1px solid #f1f5f9;
        border-radius: 8px;
      }

      .info-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #d97706;  
        margin-top: 2px;
      }

      .ss-hint {
        font-size: 0.8rem;
        color: #475569;
        line-height: 1.45;
        margin: 0;
      }

      .ss-full-width {
        width: 100%;
      }

      .currency-prefix {
        font-weight: 700;
        color: #0f172a;
        font-size: 1rem;
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
        height: 38px !important;
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
export class SetRateDialogComponent {
  dialogRef = inject(MatDialogRef<SetRateDialogComponent, SetRateDialogResult | undefined>);
  data: SetRateDialogData = inject(MAT_DIALOG_DATA);

  rateControl = new FormControl<number>(this.data.currentRate, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(1)],
  });

  save(): void {
    if (this.rateControl.invalid) return;
    this.dialogRef.close({ nightlyRate: this.rateControl.value });
  }
}