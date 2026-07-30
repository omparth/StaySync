import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface BlockDialogData {
  mode: 'BLOCK' | 'UNBLOCK';
  nightRange: string;
}

@Component({
  selector: 'app-block-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="modal-card" [class.is-block]="data.mode === 'BLOCK'" [class.is-unblock]="data.mode === 'UNBLOCK'">
      <!-- Top Accent Bar -->
      <div class="status-bar"></div>

      <!-- Header Section -->
      <div class="modal-header">
        <div class="badge-icon">
          <mat-icon>{{ data.mode === 'BLOCK' ? 'block' : 'lock_open' }}</mat-icon>
        </div>
        <div class="title-group">
          <h2 mat-dialog-title>
            {{ data.mode === 'BLOCK' ? 'Block Inventory' : 'Release Inventory' }}
          </h2>
          <div class="date-chip">
            <mat-icon class="chip-icon">date_range</mat-icon>
            <span>{{ data.nightRange }}</span>
          </div>
        </div>
      </div>

      <!-- Body Content -->
      <mat-dialog-content class="modal-body">
        @if (data.mode === 'BLOCK') {
          <p class="info-text">
            These selected nights will be marked as <strong>Unavailable</strong> across all distribution channels. Active guest bookings will override this block.
          </p>
        } @else {
          <p class="info-text">
            These nights will be restored to <strong>Available</strong> status immediately and opened for guest reservations.
          </p>
        }
      </mat-dialog-content>

      <!-- Action Footer -->
      <mat-dialog-actions align="end" class="modal-actions">
        <button mat-button class="btn-cancel" (click)="dialogRef.close(false)">
          Cancel
        </button>
        <button 
          mat-flat-button 
          [class.btn-action-block]="data.mode === 'BLOCK'"
          [class.btn-action-unblock]="data.mode === 'UNBLOCK'"
          (click)="dialogRef.close(true)">
          {{ data.mode === 'BLOCK' ? 'Confirm Block' : 'Confirm Unblock' }}
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
        position: relative;
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
      }

      .status-bar {
        height: 4px;
        width: 100%;
      }
      .is-block .status-bar { background: linear-gradient(90deg, #f43f5e, #e11d48); }
      .is-unblock .status-bar { background: linear-gradient(90deg, #10b981, #059669); }

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
        flex-shrink: 0;
      }
      .is-block .badge-icon {
        background: #fff1f2;
        color: #e11d48;
      }
      .is-unblock .badge-icon {
        background: #ecfdf5;
        color: #059669;
      }
      .badge-icon mat-icon {
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
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: #2563eb;
      }

      .modal-body {
        padding: 10px 20px 20px !important;
        margin: 0;
      }

      .info-text {
        font-size: 0.875rem;
        line-height: 1.6;
        color: #64748b;
        margin: 0;
      }

      .info-text strong {
        color: #0f172a;
        font-weight: 600;
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
        padding: 0 18px !important;
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

      .btn-action-block {
        background: #e11d48 !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);
      }

      .btn-action-block:hover {
        background: #be123c !important;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(225, 29, 72, 0.35);
      }

      .btn-action-unblock {
        background: #2563eb !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      }

      .btn-action-unblock:hover {
        background: #1d4ed8 !important;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
      }

      button:active {
        transform: translateY(0) !important;
      }
    `
  ]
})
export class BlockDialogComponent {
  dialogRef = inject(MatDialogRef<BlockDialogComponent, boolean>);
  data: BlockDialogData = inject(MAT_DIALOG_DATA);
}