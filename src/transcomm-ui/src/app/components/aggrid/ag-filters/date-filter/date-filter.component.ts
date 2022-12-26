import { Component } from '@angular/core';
import { AgFilterComponent } from '@ag-grid-community/angular';
import { IFilterParams, RowNode } from '@ag-grid-community/core';
import { isValidCondition } from '../../../../models/ag-grid.models';
import {
  FilterCondtional,
  FilterModelType,
  SearchDateConverterType,
} from '../../../../models/prismaModels';

enum FilterTypeEnum {
  equals = 'Equals',
  lt = 'Less than',
  lte = 'Less than or equals',
  gt = 'Greater than',
  gte = 'Greater than or equals',
}
@Component({
  selector: 'app-date-filter',
  templateUrl: './date-filter.component.html',
})
export class DateFilterComponent implements AgFilterComponent {
  params: IFilterParams;

  filter1: string = null;
  filter2: string = null;
  filterType1: keyof typeof FilterTypeEnum = 'equals'; // can be used for selecting type of search
  filterType2: keyof typeof FilterTypeEnum = 'lt'; // can be used for selecting type of search
  conditional: FilterCondtional = 'single';

  filterTypeEnum = FilterTypeEnum;
  filterTypeKeys = Object.keys(FilterTypeEnum);

  valueGetter: (rowNode: RowNode) => any;

  agInit(params: IFilterParams): void {
    this.params = params;
  }

  doesFilterPass(): boolean {
    // actual filter check here.
    return true;
  }

  isFilterActive(): boolean {
    return Boolean(this.filter1) && this.filter1 !== '';
  }

  getModel(): FilterModelType {
    // In here we do our prisma stuff
    let currentFilterConditional: FilterCondtional;
    if (this.conditional !== 'single' && this.filter2 === null) {
      currentFilterConditional = 'single';
    } else {
      currentFilterConditional = this.conditional;
    }

    if (this.isFilterActive()) {
      return {
        type: currentFilterConditional,
        condition1: this.equalsCorrection(this.filter1, this.filterType1),
        condition2: this.equalsCorrection(this.filter2, this.filterType2),
        isDate: true,
      };
    }
    return null;
  }

  /**
   *
   * Converts all Date requests to a range of values (denoted by gt and lt)
   *
   * @param filterValue date value to be converted as a string
   * @param filterType type of filter applied to search
   * @returns PRISMA readable range object for dates
   */
  equalsCorrection(
    filterValue: string,
    filterType: keyof typeof FilterTypeEnum,
  ): SearchDateConverterType {
    const filterDate = new Date(filterValue);
    const filterDatePlusOne = new Date(filterValue);
    filterDatePlusOne.setDate(filterDate.getDate() + 1);

    if (filterType === 'equals') {
      return {
        AND: [{ gt: filterDate }, { lt: filterDatePlusOne }],
      };
    } else if (filterType === 'gte') {
      return { AND: [{ gt: filterDate }] };
    } else if (filterType === 'lte') {
      return { AND: [{ lt: filterDatePlusOne }] };
    } else if (filterType === 'gt') {
      return { AND: [{ gt: filterDatePlusOne }] };
    } else {
      return { AND: [{ [filterType]: filterDate }] };
    }
  }

  setModel(model: FilterModelType): void {
    // here is just used for destroying. maybe use for caching
    if (!model) {
      this.filter1 = null;
      this.filter2 = null;
    }
  }

  onInputChanged($event: { [field: string]: string }): void {
    const eventType = Object.keys($event);

    if (eventType.includes('filter1')) {
      if ($event.filter1 === null || $event.filter1 === '') {
        this.setModel(null);
      } else if (this.conditional === 'single') {
        this.conditional = 'AND';
      }
    }
    this.params.filterChangedCallback(); // actually triggers the filter action
  }

  onClick(event: any): void {
    const radioButtonClicked = event.target.value;

    if (
      this.conditional !== radioButtonClicked &&
      isValidCondition(radioButtonClicked)
    ) {
      this.conditional = radioButtonClicked;
      this.onInputChanged({ click: 'click' });
    }
  }
}
