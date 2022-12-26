import { Component } from '@angular/core';
import { UpdatedICellRendererParams } from '../../../models/ag-grid.models';


@Component({
  selector: 'app-ag-retry-button',
  templateUrl: './ag-retry-button.component.html',
  styleUrls: ['./ag-retry-button.component.css'],
})
export class AgRetryButtonComponent {
  cellValue: string;
  rowIndex: number;
  disabled: boolean;
  private params: UpdatedICellRendererParams;

  agInit(params: UpdatedICellRendererParams): void {
    this.disabled = !params.value;
    this.params = params;

    this.rowIndex = params.rowIndex;
  }

  onClick(): void {
    if (!this.disabled) {
      this.params.clicked(this.rowIndex);
    }
  }
}

