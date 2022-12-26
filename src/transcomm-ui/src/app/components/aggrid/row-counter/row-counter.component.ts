import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-row-counter',
  templateUrl: './row-counter.component.html',
})
export class RowCounterComponent {
  @Input() activePage: number;
  @Input() numberPerPage: number;
  @Input() numberOfRows: number;

  footerStringFormatter(): string {
    if (!this.numberOfRows || !this.activePage || !this.numberPerPage) {
      return ``;
    }

    const fromValue = (this.activePage - 1) * this.numberPerPage + 1;
    const toValue = Math.min(
      this.activePage * this.numberPerPage,
      this.numberOfRows,
    );

    if (fromValue === toValue) {
      return `Showing row ${fromValue} of ${this.numberOfRows} rows`;
    }

    return `Showing ${fromValue} to ${toValue} of ${this.numberOfRows} rows`;
  }
}
