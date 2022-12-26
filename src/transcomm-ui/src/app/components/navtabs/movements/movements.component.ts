import { Component, Input } from '@angular/core';
import {
  MovementView,
  PackageDetailsView,
  ShippingDetailsView
} from 'core/viewModels';
import { compareDate } from 'src/app/helpers/sortHelpers';

type DetailsType = '' | 'shipping' | 'package';
interface ShownDetail {
  detailsType: DetailsType;
  indShowing: number;
}

@Component({
  selector: 'app-movements',
  templateUrl: './movements.component.html',
  styleUrls: ['./movements.component.css'],
})
export class MovementsComponent {
  @Input() set movements(els: MovementView[]) {
    els.sort((a, b) => {
      return compareDate(a.departureDate, b.departureDate);
    });
    this._movements = Array.from(els);
  }
  get movements(): MovementView[] {
    return this._movements;
  }
  shownDetails: ShownDetail = { detailsType: '', indShowing: -1 };
  displayedShippingDetails: ShippingDetailsView | null = null;
  displayedPackageDetails: PackageDetailsView | null = null;
  clickOutsideArray: number[] = []; //Track which rows have not been clicked
  private _movements: MovementView[] = [];


  toggleBox(boxType: 'shipping' | 'package', ind: number): void {
    if (
      this.shownDetails.detailsType === boxType &&
      this.shownDetails.indShowing === ind
    ) {
      this.hideBoxes(ind);
      return;
    }

    if (boxType === 'shipping') {
      this.displayedShippingDetails = Object.assign(
        {},
        this.movements[ind].shippingDetails,
      );
    } else {
      this.displayedPackageDetails = Object.assign(
        {},
        this.movements[ind].packageDetails,
      );
    }

    this.shownDetails = Object.assign(
      {},
      {
        detailsType: boxType,
        indShowing: ind,
      },
    );
    this.clickOutsideArray = [];
  }

  // Hide boxes only when every row has fired. Only hides when clickOutsideArray is full.
  hideBoxes(ind: number): void {
    if (this.shownDetails.indShowing === -1) {
      // Boxes already hidden - do nothing
      return;
    }

    if (!this.clickOutsideArray.includes(ind)) {
      this.clickOutsideArray.push(ind);
    }

    if (this.clickOutsideArray.length === this.movements.length) {
      this.shownDetails = Object.assign(
        {},
        {
          detailsType: '' as DetailsType,
          indShowing: -1,
        },
      );
      this.clickOutsideArray = [];
    }
  }
}
