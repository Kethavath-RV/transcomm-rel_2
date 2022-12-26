import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IFilterParams } from '@ag-grid-community/core';
import {
  FilterModelType,
  SearchTypeText,
} from '../../../../models/prismaModels';
import { TextFilterComponent } from './text-filter.component';

const iFilterParamsMock: IFilterParams = {
  api: null,
  column: null,
  columnApi: null,
  colDef: null,
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

describe('TextFilterComponent', () => {
  let component: TextFilterComponent;
  let fixture: ComponentFixture<TextFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextFilterComponent],
      imports: [FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextFilterComponent);
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
      component.filter1 = 'search';
      const result = component.isFilterActive();
      expect(result).toBe(true);
    });
    it('returns false if filter1 is null', () => {
      const result = component.isFilterActive();
      expect(result).toBe(false);
    });
    it('returns false if filter1 is empty string', () => {
      component.filter1 = '';
      const result = component.isFilterActive();
      expect(result).toBe(false);
    });
  });

  describe('getModel', () => {
    it('returns a single condition if filtertype is single', () => {
      const conditional = 'single';
      const filterType1: keyof SearchTypeText = 'equals';
      const filter1 = 'search';
      const filterModel: FilterModelType = {
        type: conditional,
        condition1: { [filterType1]: filter1 },
        condition2: { contains: '' },
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
      const filterType1: keyof SearchTypeText = 'equals';
      const filter1 = 'search1';
      const filterType2: keyof SearchTypeText = 'contains';
      const filter2 = 'search2';
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
      const filterType1: keyof SearchTypeText = 'equals';
      const filter1 = 'search1';
      const filterType2: keyof SearchTypeText = 'contains';
      const filter2 = 'search2';
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
      const filterType1: keyof SearchTypeText = 'equals';
      const filter1 = 'search1';
      const filterType2: keyof SearchTypeText = 'contains';
      const filter2 = '';

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
    it('sets model to empty string if null is supplied', () => {
      component.filter1 = 'search1';
      component.filter2 = 'search2';

      component.setModel(null);

      expect(component.filter1).toBe('');
      expect(component.filter2).toBe('');
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