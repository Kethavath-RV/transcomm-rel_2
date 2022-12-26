import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgGridModule } from '@ag-grid-community/angular';
import {
  ColumnApi,
  GridApi,
  GridReadyEvent,
  RowDoubleClickedEvent,
  RowNode,
} from '@ag-grid-community/core';
import { Paginated } from 'core/viewModels';
import { Observable, of } from 'rxjs';
import { AggridService } from '../../services/aggrid.service';
import { AggridComponent } from './aggrid.component';

interface TestType {
  field1: string;
  field2: number;
}

const mockTestTypeData: TestType[] = [
  {
    field1: 'first field',
    field2: 1,
  },
  {
    field1: 'second field',
    field2: 2,
  },
];

const mockColumnDefs = [
  {
    headerName: 'Field one',
    field: 'field1',
    filter: 'textFilter',
  },
  {
    headerName: 'Field two',
    field: 'field2',
  },
];

class MockAggridService {
  activePage = 1;
  numberOfPages = 1;
  numberOfRows = 2;
  numberPerPage = 10;

  setNumberOfRecords = () => {
    return null;
  };
  clearService = () => {
    return null;
  };
  setGridApis = () => {
    return null;
  };
  newPageHandler = () => {
    return null;
  };
  onSortChanged = () => {
    return null;
  };
  onFilterChanged = () => {
    return null;
  };
}

@Component({
  selector: 'app-row-counter',
  template: '<p>Mock row-counter Component</p>',
})
class MockRowCounterComponent {
  @Input() activePage: number;
  @Input() numberPerPage: number;
  @Input() numberOfRows: number;
}

@Component({
  selector: 'app-pagination',
  template: '<p>Mock pagination Component</p>',
})
class MockPaginationComponent {
  @Input() activePage: number;
  @Input() numberOfPages: number;
  @Output() onNewPageSet = new EventEmitter<number>();
}

describe('AggridComponent', () => {
  let component: AggridComponent<TestType>;
  let fixture: ComponentFixture<AggridComponent<TestType>>;
  let aggridService: AggridService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgGridModule.withComponents([])],
      declarations: [
        AggridComponent,
        MockRowCounterComponent,
        MockPaginationComponent,
      ],
      providers: [{ provide: AggridService, useClass: MockAggridService }],
    }).compileComponents();
    aggridService = TestBed.inject(AggridService);
  });

  beforeEach(() => {
    fixture =
      TestBed.createComponent<AggridComponent<TestType>>(AggridComponent);
    component = fixture.componentInstance;
    component.paginatedData$ = of({
      data: mockTestTypeData,
      numberOfRecords: mockTestTypeData.length,
    });
    component.columnDefs = mockColumnDefs;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('has values', () => {
      expect(component.columnDefs).toEqual(mockColumnDefs);
      expect(component.gridOptions).not.toBeUndefined();
      const setDataSpy = jest.spyOn(component, 'setData');
      component.paginatedData$ = of();
      expect(setDataSpy).toBeCalled();
    });
  });

  describe('setData', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update the rowdata variable', async () => {
      const newData = mockTestTypeData.concat({
        field1: 'new field',
        field2: 3,
      });
      const paginatedData$: Observable<Paginated<TestType>> = of({
        data: newData,
        numberOfRecords: newData.length,
      });
      const serviceSpy = jest.spyOn(aggridService, 'setNumberOfRecords');

      component.setData(paginatedData$);
      expect(component.rowData).toEqual(newData);
      expect(serviceSpy).toHaveBeenCalledWith(newData.length);
    });
  });

  describe('Service calls', () => {
    it('onGridReady calls setGridApis', () => {
      const params: GridReadyEvent = {
        type: 'tmp',
        api: new GridApi(),
        columnApi: new ColumnApi(),
      };
      const serviceSpy = jest.spyOn(aggridService, 'setGridApis');

      component.onGridReady(params);

      expect(serviceSpy).toHaveBeenCalledWith(params);
    });
    it('newPageHandler calls newPageHandler', () => {
      const newPage = 2;
      const serviceSpy = jest.spyOn(aggridService, 'newPageHandler');

      component.newPageHandler(newPage);

      expect(serviceSpy).toHaveBeenCalledWith(newPage);
    });
    it('onSortChanged calls onSortChanged', () => {
      const serviceSpy = jest.spyOn(aggridService, 'onSortChanged');

      component.onSortChanged();

      expect(serviceSpy).toHaveBeenCalled();
    });
    it('onFilterChanged calls onFilterChanged', () => {
      const serviceSpy = jest.spyOn(aggridService, 'onFilterChanged');

      component.onFilterChanged();

      expect(serviceSpy).toHaveBeenCalled();
    });
    it('ngOnDestroy calls clearService', () => {
      const serviceSpy = jest.spyOn(aggridService, 'clearService');

      component.ngOnDestroy();

      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  describe('onRowDoubleClicked', () => {
    it('should emit an event', () => {
      const event: RowDoubleClickedEvent = {
        context: 'a',
        data: {},
        node: new RowNode(null),
        api: new GridApi(),
        columnApi: new ColumnApi(),
        rowIndex: 0,
        type: 'rowDoubleClicked',
        rowPinned: null,
      };
      const eventSpy = jest.spyOn(component.onRowDoubleClickedEvent, 'emit');

      component.onRowDoubleClicked(event);

      expect(eventSpy).toHaveBeenCalledWith(event);
    });
  });
});
