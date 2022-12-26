import { Component, Input } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal-template',
  templateUrl: './modal-template.component.html',
  styleUrls: ['./modal-template.component.css'],
})
export class ModalTemplateComponent<T, TInpt, TOutpt> {
  @Input() dismissable = true;

  constructor(private modalService: ModalService<T, TInpt, TOutpt>) {}

  async close(outputData: TOutpt = {} as TOutpt): Promise<void> {
    if (!this.dismissable) return;
    setTimeout(async () => {
      await this.modalService.close(outputData);
    }, 200);
  }
}
