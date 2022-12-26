import { Component } from '@angular/core';
import { AgFilterComponent } from '@ag-grid-community/angular';
import { IFilterParams } from '@ag-grid-community/core';
import { isValidCondition } from '../../../../models/ag-grid.models';
import {
  FilterCondtional,
  FilterModelType,
} from '../../../../models/prismaModels';

enum FilterTypeEnum {
  contains = 'Contains',
  equals = 'Equals',
}
@Component({
  selector: 'app-text-filter',
  templateUrl: './text-filter.component.html',
})
export class TextFilterComponent implements AgFilterComponent {
  params: IFilterParams;
  filter1 = '';
  filter2 = '';
  filterType1: keyof typeof FilterTypeEnum = 'contains'; // can be used for selecting type of search
  filterType2: keyof typeof FilterTypeEnum = 'contains'; // can be used for selecting type of search
  conditional: FilterCondtional = 'single';

  filterTypeEnum = FilterTypeEnum;
  filterTypeKeys = Object.keys(FilterTypeEnum);

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
    if (this.conditional !== 'single' && !this.filter2) {
      currentFilterConditional = 'single';
    } else {
      currentFilterConditional = this.conditional;
    }
    // In here we do our prisma stuff
    if (this.isFilterActive()) {
      return {
        type: currentFilterConditional,
        condition1: {
          [this.filterType1]: this.filter1,
        },
        condition2: {
          [this.filterType2]: this.filter2,
        },
        isDate: false,
      };
    }
    return null;
  }

  setModel(model: FilterModelType): void {
    // here is just used for destroying. maybe use for caching
    if (!model) {
      this.filter1 = '';
      this.filter2 = '';
      this.conditional = 'single';
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
