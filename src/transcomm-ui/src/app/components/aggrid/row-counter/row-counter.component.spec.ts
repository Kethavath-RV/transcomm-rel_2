import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RowCounterComponent } from './row-counter.component';

describe('RowCounterComponent', () => {
  let component: RowCounterComponent;
  let fixture: ComponentFixture<RowCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RowCounterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RowCounterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('footerStringFormatter', () => {
    describe('bad inputs', () => {
      it('returns an empty string if no data is supplied', () => {
        const stringFormatter = component.footerStringFormatter();
        expect(stringFormatter).toBe('');
      });
      it('returns an empty string if numberPerPage is missing', () => {
        component.activePage = 1;
        component.numberOfRows = 10;
        const stringFormatter = component.footerStringFormatter();
        expect(stringFormatter).toBe('');
      });
      it('returns an empty string if numberOfRows is missing', () => {
        component.activePage = 1;
        component.numberPerPage = 10;
        const stringFormatter = component.footerStringFormatter();
        expect(stringFormatter).toBe('');
      });
      it('returns an empty string if activePage is missing', () => {
        component.numberPerPage = 10;
        component.numberOfRows = 10;
        const stringFormatter = component.footerStringFormatter();
        expect(stringFormatter).toBe('');
      });
      it('returns an empty string if activePage is 0', () => {
        component.numberPerPage = 10;
        component.numberOfRows = 10;
        component.activePage = 0;
        const stringFormatter = component.footerStringFormatter();
        expect(stringFormatter).toBe('');
      });
      it('returns an empty string if numberOfRows is 0', () => {
        component.numberPerPage = 10;
        component.numberOfRows = 0;
        component.activePage = 1;
        const stringFormatter = component.footerStringFormatter();
        expect(stringFormatter).toBe('');
      });
    });
    describe('good inputs', () => {
      describe('one row on page', () => {
        it('one row altogether', () => {
          const numberPerPage = 10;
          const numberOfRows = 1;
          const activePage = 1;

          component.numberPerPage = numberPerPage;
          component.numberOfRows = numberOfRows;
          component.activePage = activePage;
          const stringFormatter = component.footerStringFormatter();
          expect(stringFormatter).toBe(`Showing row 1 of 1 rows`);
        });
        it('last row on page should be handled', () => {
          const numberPerPage = 10;
          const numberOfRows = 51;
          const activePage = 6;

          component.numberPerPage = numberPerPage;
          component.numberOfRows = numberOfRows;
          component.activePage = activePage;
          const stringFormatter = component.footerStringFormatter();
          expect(stringFormatter).toBe(`Showing row 51 of 51 rows`);
        });
      });

      describe('multiple rows on page', () => {
        it('handles one page case', () => {
          const numberPerPage = 10;
          const numberOfRows = 5;
          const activePage = 1;

          component.numberPerPage = numberPerPage;
          component.numberOfRows = numberOfRows;
          component.activePage = activePage;
          const stringFormatter = component.footerStringFormatter();
          expect(stringFormatter).toBe(`Showing 1 to 5 of 5 rows`);
        });
        it('handles multiple pages', () => {
          const numberPerPage = 10;
          const numberOfRows = 15;
          const activePage = 1;

          component.numberPerPage = numberPerPage;
          component.numberOfRows = numberOfRows;
          component.activePage = activePage;
          const stringFormatter = component.footerStringFormatter();
          expect(stringFormatter).toBe(`Showing 1 to 10 of 15 rows`);
        });
        it('goes to second page', () => {
          const numberPerPage = 10;
          const numberOfRows = 15;
          const activePage = 2;

          component.numberPerPage = numberPerPage;
          component.numberOfRows = numberOfRows;
          component.activePage = activePage;
          const stringFormatter = component.footerStringFormatter();
          expect(stringFormatter).toBe(`Showing 11 to 15 of 15 rows`);
        });
      });
    });
  });
});
