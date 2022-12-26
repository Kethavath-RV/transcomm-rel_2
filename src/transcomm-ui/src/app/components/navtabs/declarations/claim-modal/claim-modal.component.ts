import { Component, Input } from '@angular/core';
import { ClaimView } from 'core/viewModels';

@Component({
  selector: 'app-claim-modal',
  templateUrl: './claim-modal.component.html',
})
export class ClaimModalComponent {
  @Input() claim: ClaimView;
}
