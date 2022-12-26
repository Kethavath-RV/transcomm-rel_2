import { Component, Input } from '@angular/core';
import { PackageDetailsView } from 'core/viewModels';

@Component({
  selector: 'app-package-details',
  templateUrl: './package-details.component.html',
})
export class PackageDetailsComponent {
  @Input() packageDetails: PackageDetailsView;
}
