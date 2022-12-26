import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IFilterParams } from '@ag-grid-community/core';
import { FilterModelType } from '../../../../models/prismaModels';
import { DateFilterComponent } from './date-filter.component';

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

enum FilterTypeEnum {
  equals = 'Equals',
  lt = 'Less than',
  lte = 'Less than or equals',
  gt = 'Greater than',
  gte = 'Greater than or equals',
}

describe('DateFilterComponent', () => {
  let component: DateFilterComponent;
  let fixture: ComponentFixture<DateFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateFilterComponent],
      imports: [FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateFilterComponent);
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
      component.filter1 = '2022-02-22';
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
      const filterType1: keyof typeof FilterTypeEnum = 'lt';
      const filter1 = '2022-02-22';
      const filter1Date = new Date(filter1);
      const condition1 = { AND: [{ lt: filter1Date }] };
      const condition2 = { AND: [{ lt: null }] };

      const filterModel: FilterModelType = {
        type: conditional,
        condition1: condition1,
        condition2: condition2,
        isDate: true,
      };

      const equalsCorrectionSpy = jest
        .spyOn(component, 'equalsCorrection')
        .mockImplementation((filter) => {
          if (filter === filter1) {
            return condition1;
          } else {
            return condition2;
          }
        });
      jest.spyOn(component, 'isFilterActive').mockReturnValue(true);

      component.conditional = conditional;
      component.filterType1 = filterType1;
      component.filter1 = filter1;

      const returnValue = component.getModel();

      expect(equalsCorrectionSpy).toBeCalledTimes(2);
      expect(returnValue).toEqual(filterModel);
    });

    it('returns a both conditions if filtertype is AND', () => {
      const conditional = 'AND';
      const filterType1: keyof typeof FilterTypeEnum = 'lt';
      const filter1 = '2022-02-22';
      const filter1Date = new Date(filter1);
      const condition1 = { AND: [{ lt: filter1Date }] };
      const filterType2: keyof typeof FilterTypeEnum = 'gt';
      const filter2 = '2022-02-21';
      const filter2Date = new Date(filter2);
      const condition2 = { AND: [{ lt: filter2Date }] };

      const filterModel: FilterModelType = {
        type: conditional,
        condition1: condition1,
        condition2: condition2,
        isDate: true,
      };

      const equalsCorrectionSpy = jest
        .spyOn(component, 'equalsCorrection')
        .mockImplementation((filter) => {
          if (filter === filter1) {
            return condition1;
          } else {
            return condition2;
          }
        });
      jest.spyOn(component, 'isFilterActive').mockReturnValue(true);

      component.conditional = conditional;
      component.filterType1 = filterType1;
      component.filter1 = filter1;
      component.filterType2 = filterType2;
      component.filter2 = filter2;

      const returnValue = component.getModel();

      expect(equalsCorrectionSpy).toBeCalledTimes(2);
      expect(returnValue).toEqual(filterModel);
    });

    it('returns a both conditions if filtertype is OR', () => {
      const conditional = 'OR';
      const filterType1: keyof typeof FilterTypeEnum = 'lt';
      const filter1 = '2022-02-22';
      const filter1Date = new Date(filter1);
      const condition1 = { AND: [{ lt: filter1Date }] };
      const filterType2: keyof typeof FilterTypeEnum = 'gt';
      const filter2 = '2022-02-21';
      const filter2Date = new Date(filter2);
      const condition2 = { AND: [{ lt: filter2Date }] };

      const filterModel: FilterModelType = {
        type: conditional,
        condition1: condition1,
        condition2: condition2,
        isDate: true,
      };

      const equalsCorrectionSpy = jest
        .spyOn(component, 'equalsCorrection')
        .mockImplementation((filter) => {
          if (filter === filter1) {
            return condition1;
          } else {
            return condition2;
          }
        });
      jest.spyOn(component, 'isFilterActive').mockReturnValue(true);

      component.conditional = conditional;
      component.filterType1 = filterType1;
      component.filter1 = filter1;
      component.filterType2 = filterType2;
      component.filter2 = filter2;

      const returnValue = component.getModel();

      expect(equalsCorrectionSpy).toBeCalledTimes(2);
      expect(returnValue).toEqual(filterModel);
    });

    it('reverts to a single if second filter is empty', () => {
      const conditional = 'OR';
      const filterType1: keyof typeof FilterTypeEnum = 'lt';
      const filter1 = '2022-02-22';
      const filter1Date = new Date(filter1);
      const condition1 = { AND: [{ lt: filter1Date }] };
      const filterType2: keyof typeof FilterTypeEnum = 'gt';
      const filter2 = null;

      const condition2 = { AND: [{ lt: null }] };

      const filterModel: FilterModelType = {
        type: 'single',
        condition1: condition1,
        condition2: condition2,
        isDate: true,
      };

      const equalsCorrectionSpy = jest
        .spyOn(component, 'equalsCorrection')
        .mockImplementation((filter) => {
          if (filter === filter1) {
            return condition1;
          } else {
            return condition2;
          }
        });
      jest.spyOn(component, 'isFilterActive').mockReturnValue(true);

      component.conditional = conditional;
      component.filterType1 = filterType1;
      component.filter1 = filter1;
      component.filterType2 = filterType2;
      component.filter2 = filter2;

      const returnValue = component.getModel();

      expect(equalsCorrectionSpy).toBeCalledTimes(2);
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
      component.filter1 = '2022-02-22';
      component.filter2 = '2022-02-21';

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

  describe('equalsCorrection', () => {
    it('returns equals as range', () => {
      const date = '2022-02-22';
      const datePlusOne = '2022-02-23';
      const filterType = 'equals';

      const expectedReturnValue = {
        AND: [{ gt: new Date(date) }, { lt: new Date(datePlusOne) }],
      };
      const returnValue = component.equalsCorrection(date, filterType);

      expect(returnValue).toEqual(expectedReturnValue);
    });
    it('returns gte as gt', () => {
      const date = '2022-02-22';

      const filterType = 'gte';

      const expectedReturnValue = { AND: [{ gt: new Date(date) }] };
      const returnValue = component.equalsCorrection(date, filterType);

      expect(returnValue).toEqual(expectedReturnValue);
    });
    it('returns lte as lt', () => {
      const date = '2022-02-22';
      const datePlusOne = '2022-02-23';

      const filterType = 'lte';

      const expectedReturnValue = { AND: [{ lt: new Date(datePlusOne) }] };
      const returnValue = component.equalsCorrection(date, filterType);

      expect(returnValue).toEqual(expectedReturnValue);
    });
    it('returns lt as lt', () => {
      const date = '2022-02-22';

      const filterType = 'lt';

      const expectedReturnValue = { AND: [{ lt: new Date(date) }] };
      const returnValue = component.equalsCorrection(date, filterType);

      expect(returnValue).toEqual(expectedReturnValue);
    });
    it('returns gt as gt', () => {
      const date = '2022-02-22';
      const datePlusOne = '2022-02-23';

      const filterType = 'gt';

      const expectedReturnValue = { AND: [{ gt: new Date(datePlusOne) }] };
      const returnValue = component.equalsCorrection(date, filterType);

      expect(returnValue).toEqual(expectedReturnValue);
    });
  });
});
