import { Component, Input, OnInit } from '@angular/core';
import { HouseBillView } from 'core/viewModels';
import { compareDate } from 'src/app/helpers/sortHelpers';

@Component({
  selector: 'app-house-bills',
  templateUrl: './house-bills.component.html',
  styleUrls: ['./house-bills.component.css']
})
export class HouseBillsComponent implements OnInit {
  @Input() set houseBills(bills: HouseBillView[]) {
    bills.sort((a, b) => {
      return compareDate(a.eventDate, b.eventDate);
    });
    this._houseBills = bills;
  }
  get houseBills(): HouseBillView[] {
    return this._houseBills;
  }
  private _houseBills!: HouseBillView[];
  columns = [
    { displayName: 'Airway Bill No.', selector: 'airwayBillNumber' },
    { displayName: 'No. of packages', selector: 'numberOfPackages' },
    { displayName: 'Weight + Unit', selector: 'weightAndQualifier' },
    { displayName: 'Volume Weight + Unit', selector: 'volumeAndQualifier' },
    { displayName: 'Declared Value + Currency', selector: 'declaredValue' },
  ];

  ngOnInit(): void {
    this.houseBills.sort((a, b) => {
      return compareDate(a.eventDate, b.eventDate);
    });
  }
}
