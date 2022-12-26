/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-ag-link',
  template: '<p>lmao</p>',
})
export class MockAgLinkComponent {
  cellValue: string;
  hyperlink: string;

  agInit(_params: ICellRendererParams): void {
    return;
  }
  refresh(_params: ICellRendererParams): void {
    return;
  }
  setHyperLink(_params: ICellRendererParams): void {
    return;
  }
  getValueToDisplay(params: ICellRendererParams): string {
    return params.valueFormatted ? params.valueFormatted : params.value;
  }
  setCellValue(_params: ICellRendererParams): void {
    return;
  }
}
