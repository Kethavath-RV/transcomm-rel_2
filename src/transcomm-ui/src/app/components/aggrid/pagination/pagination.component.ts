import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

interface Pagination {
  page: number;
  active: boolean;
}

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() numberOfPages: number;
  @Input() activePage: number;
  @Output() onNewPageSet = new EventEmitter<number>();

  numberPaginationPoints = 5; // declaring as a variable to allow easy adjustments on reuse.

  paginationArray: Pagination[] = [];
  newPaginationArray: Pagination[];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activePage) {
      if (!changes.activePage.firstChange)
        this.onPageChanged(changes.activePage.currentValue);
    }
  }

  ngOnInit(): void {
    this.createInitialPaginationArray();
  }

  onPageChanged(newActivePage: number): void {
    this.addActivePageToNewPaginationArray(newActivePage);
    let i = 1;
    while (
      this.newPaginationArray.length < this.numberPaginationPoints &&
      this.newPaginationArray.length < this.numberOfPages
    ) {
      this.addNextPagesToNewPaginationArray(newActivePage, i);
      this.addPreviousPagesToNewPaginationArray(newActivePage, i);
      i++;
    }
    this.paginationArray = this.newPaginationArray;
  }

  addActivePageToNewPaginationArray(newActivePage: number): void {
    this.newPaginationArray = [{ page: newActivePage, active: true }];
  }

  addNextPagesToNewPaginationArray(newActivePage: number, i: number): void {
    if (newActivePage + i <= this.numberOfPages) {
      this.newPaginationArray.push({ page: newActivePage + i, active: false });
    }
  }

  addPreviousPagesToNewPaginationArray(newActivePage: number, i: number): void {
    if (newActivePage - i >= 1) {
      this.newPaginationArray.unshift({
        page: newActivePage - i,
        active: false,
      });
    }
  }

  previousPageHandler(): void {
    const activeIndex = this.paginationArray.findIndex((item) => item.active);
    const newActivePage = this.paginationArray[activeIndex].page - 1;

    if (newActivePage >= 1) {
      this.newPageSet(newActivePage);
    }
  }

  nextPageHandler(): void {
    const activeIndex = this.paginationArray.findIndex((page) => page.active);
    const newActivePage = this.paginationArray[activeIndex].page + 1;

    if (newActivePage <= this.numberOfPages) {
      this.newPageSet(newActivePage);
    }
  }

  newPageSet(newPage: number): void {
    this.onNewPageSet.emit(newPage);
  }

  createInitialPaginationArray(): void {
    for (
      let i = 1;
      i <= this.numberPaginationPoints && i <= this.numberOfPages;
      i++
    ) {
      this.paginationArray.push({ page: i, active: i === 1 });
    }
  }
}
