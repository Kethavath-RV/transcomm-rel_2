import { Component } from '@angular/core';
import { AgFilterComponent } from '@ag-grid-community/angular';
import { IFilterParams } from '@ag-grid-community/core';
import { FilterModelType } from '../../../../models/prismaModels';

@Component({
  selector: 'app-boolean-filter',
  templateUrl: './boolean-filter.component.html',
})
export class BooleanFilterComponent implements AgFilterComponent {
  params: IFilterParams;
  filters = ['', 'true', 'false'];
  filter: '' | 'true' | 'false';
  filterType = 'equals';

  agInit(params: IFilterParams): void {
    this.params = params;
  }

  doesFilterPass(): boolean {
    // actual filter check here.
    return true; // rely on BE for filters
  }

  isFilterActive(): boolean {
    return Boolean(this.filter);
  }

  getModel(): FilterModelType {
    // In here we do our prisma stuff

    if (this.isFilterActive()) {
      const boolForPrisma: boolean = this.filter === 'true';
      return {
        type: 'single',
        condition1: {
          [this.filterType]: boolForPrisma,
        },
        isDate: false,
      };
    }
    return null;
  }

  setModel(model: FilterModelType): void {
    // here is just used for destroying. maybe use for caching
    if (!model) {
      this.filter = null;
    }
  }

  onInputChanged($event: { [field: string]: string }) {
    const eventType = Object.keys($event);

    if (eventType.includes('filter')) {
      if ($event.filter === null || $event.filter === '') {
        this.setModel(null);
      }
    }

    this.params.filterChangedCallback(); // actually triggers the filter action
  }
}
