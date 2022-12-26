import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IFilterParams } from '@ag-grid-community/core';
import { FilterModelType } from '../../../../models/prismaModels';
import { BooleanFilterComponent } from './boolean-filter.component';

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

describe('BooleanFilterComponent', () => {
  let component: BooleanFilterComponent;
  let fixture: ComponentFixture<BooleanFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BooleanFilterComponent],
      imports: [FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BooleanFilterComponent);
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
    it('returns true if filter is defined', () => {
      component.filter = 'true';
      const result = component.isFilterActive();
      expect(result).toBe(true);
    });
    it('returns false if filter is undefined', () => {
      const result = component.isFilterActive();
      expect(result).toBe(false);
    });
    it('returns false if filter is null', () => {
      component.filter = null;
      const result = component.isFilterActive();
      expect(result).toBe(false);
    });
  });

  describe('getModel', () => {
    it('returns a single condition if filtertype is single', () => {
      const filterType = 'equals';
      const filter = 'true';
      const filterModel: FilterModelType = {
        type: 'single',
        condition1: { [filterType as string]: true },
        isDate: false,
      };
      jest.spyOn(component, 'isFilterActive').mockReturnValue(true);

      component.filterType = filterType;
      component.filter = filter;

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
      component.filter = 'true';

      component.setModel(null);

      expect(component.filter).toBe(null);
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
      const event = { filter: 'input' };

      component.onInputChanged(event);
      expect(filterChangeCallbackSpy).toHaveBeenCalled();
    });
    it('should reset model when filter is empty', () => {
      const event = { filter: null };
      const setModelSpy = jest.spyOn(component, 'setModel');

      component.onInputChanged(event);

      expect(setModelSpy).toBeCalledWith(null);
      expect(filterChangeCallbackSpy).toHaveBeenCalled();
    });
    it('should set conditional to AND filter is no longer empty', () => {
      const event = { filter: 'new' };

      component.onInputChanged(event);

      expect(filterChangeCallbackSpy).toHaveBeenCalled();
    });
  });
});
