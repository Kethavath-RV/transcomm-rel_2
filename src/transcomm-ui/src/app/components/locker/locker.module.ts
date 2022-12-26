import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { LockerComponent } from "./locker.component";

@NgModule({
    imports: [CommonModule],
    declarations: [LockerComponent],
    exports: [LockerComponent]
})
export class LockerModule {}