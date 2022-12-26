import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IFilterParams } from '@ag-grid-community/core';
import {
  FilterModelType,
  SearchTypeNumber,
} from '../../../../models/prismaModels';
import { NumberFilterComponent } from './number-filter.component';

const iFilterParamsMock: IFilterParams = {
  api: null,
  column: null,
  colDef: null,
  columnApi: null,
  rowModel: null,
  filterChangedCallback: () => {
    return;
  },
  filterModifiedCallback: () => {
    return;
  },
  valueGetter: () => 'mockReturn',
  doesRowPassOtherFilter: () => true,
  /** The context as provided on `gridOptions.context` */
  context: null,
};

describe('NumberFiltersComponent', () => {
  let component: NumberFilterComponent;
  let fixture: ComponentFixture<NumberFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NumberFilterComponent],
      imports: [FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('doesfilterPass', () => {
    it('returns true', () => {
      // can be extended if FE needs to check data
      const result = component.doesFilterPass();
      expect(result).toBe(true);
    });
  });

  describe('isFilterActive', () => {
    it('returns true if filter1 is defined', () => {
      component.filter1 = 1;

      const result = component.isFilterActive();

      expect(result).toBe(true);
    });
    it('returns false if filter1 is null', () => {
      const result = component.isFilterActive();

      expect(result).toBe(false);
    });
  });
  describe('getModel', () => {
    it('returns a single condition if filtertype is single', () => {
      const conditional = 'single';
      const filterType1: keyof SearchTypeNumber = 'equals';
      const filter1 = 1;
      const filterModel: FilterModelType = {
        type: conditional,
        condition1: { [filterType1]: filter1 },
        condition2: { equals: null },
        isDate: false,
      };
      jest.spyOn(component, 'isFilterActive').mockReturnValue(true);
      component.conditional = conditional;
      component.filterType1 = filterType1;
      component.filter1 = filter1;

      const returnValue = component.getModel();

      expect(returnValue).toEqual(filterModel);
    });
    it('returns a both conditions if filtertype is AND', () => {
      const conditional = 'AND';
      const filterType1: keyof SearchTypeNumber = 'equals';
      const filter1 = 1;
      const filterType2: keyof SearchTypeNumber = 'gt';
      const filter2 = 2;
      const filterModel: FilterModelType = {
        type: conditional,
        condition1: { [filterType1]: filter1 },
        condition2: { [filterType2]: filter2 },
        isDate: false,
      };
      jest.spyOn(component, 'isFilterActive').mockReturnValue(true);
      component.conditional = conditional;
      component.filterType1 = filterType1;
      component.filter1 = filter1;
      component.filterType2 = filterType2;
      component.filter2 = filter2;

      const returnValue = component.getModel();

      expect(returnValue).toEqual(filterModel);
    });
    it('returns a both conditions if filtertype is OR', () => {
      const conditional = 'OR';
      const filterType1: keyof SearchTypeNumber = 'equals';
      const filter1 = 1;
      const filterType2: keyof SearchTypeNumber = 'gt';
      const filter2 = 2;
      const filterModel: FilterModelType = {
        type: conditional,
        condition1: { [filterType1]: filter1 },
        condition2: { [filterType2]: filter2 },
        isDate: false,
      };
      jest.spyOn(component, 'isFilterActive').mockReturnValue(true);
      component.conditional = conditional;
      component.filterType1 = filterType1;
      component.filter1 = filter1;
      component.filterType2 = filterType2;
      component.filter2 = filter2;

      const returnValue = component.getModel();

      expect(returnValue).toEqual(filterModel);
    });
    it('returns a single condition if filter2 is null', () => {
      const conditional = 'OR';
      const filterType1: keyof SearchTypeNumber = 'equals';
      const filter1 = 1;
      const filterType2: keyof SearchTypeNumber = 'gt';
      const filter2 = null;

      const filterModel: FilterModelType = {
        type: 'single',
        condition1: { [filterType1]: filter1 },
        condition2: { [filterType2]: filter2 },
        isDate: false,
      };
      jest.spyOn(component, 'isFilterActive').mockReturnValue(true);
      component.conditional = conditional;
      component.filterType1 = filterType1;
      component.filter1 = filter1;
      component.filterType2 = filterType2;

      const returnValue = component.getModel();

      expect(returnValue).toEqual(filterModel);
    });
    it('returns nothing if filter is not active', () => {
      jest.spyOn(component, 'isFilterActive').mockReturnValue(false);

      const returnValue = component.getModel();

      expect(returnValue).toEqual(null);
    });
  });
  describe('setModel', () => {
    it('sets model to null if null is supplied', () => {
      component.filter1 = 1;
      component.filter2 = 2;

      component.setModel(null);

      expect(component.filter1).toBeNull();
      expect(component.filter2).toBeNull();
    });
  });

  describe('onInputChanged', () => {
    let filterChangeCallbackSpy;
    beforeEach(async () => {
      component.params = iFilterParamsMock;
      filterChangeCallbackSpy = jest.spyOn(
        component.params,
        'filterChangedCallback',
      );
    });
    it('should trigger filter callback', () => {
      const event = { filter1: 'input' };

      component.conditional = 'single';
      component.onInputChanged(event);
      expect(filterChangeCallbackSpy).toHaveBeenCalled();
    });
    it('should reset model when filter1 is empty', () => {
      const event = { filter1: null };
      const setModelSpy = jest.spyOn(component, 'setModel');

      component.conditional = 'single';
      component.onInputChanged(event);

      expect(setModelSpy).toBeCalledWith(null);
      expect(filterChangeCallbackSpy).toHaveBeenCalled();
    });
    it('should set conditional to AND filter1 is no longer empty', () => {
      const event = { filter1: 'new' };

      component.conditional = 'single';
      component.onInputChanged(event);

      expect(component.conditional).toBe('AND');
      expect(filterChangeCallbackSpy).toHaveBeenCalled();
    });
  });

  describe('onClick', () => {
    const event = { target: { value: 'AND' } };
    it('calls onInputchanged when new condition chosen', () => {
      component.conditional = 'single';
      component.params = iFilterParamsMock;
      const inputChangedSpy = jest.spyOn(component, 'onInputChanged');

      component.onClick(event);
      expect(component.conditional).toEqual(event.target.value);
      expect(inputChangedSpy).toBeCalled();
    });
    it('does nothing when no change detected ', () => {
      component.conditional = 'AND';
      const inputChangedSpy = jest.spyOn(component, 'onInputChanged');

      component.onClick(event);
      expect(inputChangedSpy).not.toBeCalled();
    });
  });
});
