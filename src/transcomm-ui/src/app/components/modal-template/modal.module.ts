import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ModalTemplateComponent } from "./modal-template.component";

@NgModule({
    imports: [CommonModule],
    declarations: [ModalTemplateComponent],
    exports: [ModalTemplateComponent]
})
export class ModalModule {}
