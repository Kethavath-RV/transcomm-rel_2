import { Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-ag-link',
  templateUrl: './ag-link.component.html',
})
export class AgLinkComponent {
  cellValue: string;
  hyperlink: string;

  agInit(params: ICellRendererParams): void {
    this.setHyperLink(params);
    this.setCellValue(params);
  }

  // gets called whenever the cell refreshes
  refresh(params: ICellRendererParams): void {
    // set value into cell again
    this.setHyperLink(params);
    this.setCellValue(params);
  }

  setHyperLink(params: ICellRendererParams): void {
    this.hyperlink = `./${params.data.ecomCode}/${params.data.orderNumber}/${params.data.invoiceNumber}`;
  }

  getValueToDisplay(params: ICellRendererParams): string {
    return params.valueFormatted ? params.valueFormatted : params.value;
  }

  setCellValue(params: ICellRendererParams): void {
    this.cellValue = this.getValueToDisplay(params);
  }
}
