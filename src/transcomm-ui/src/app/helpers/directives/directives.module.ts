import { NgModule } from '@angular/core';
import { ClickOutsideDirective } from './click-outside.directive';
import { DebounceClickDirective } from './debounce-click.directive';

@NgModule({
  imports: [],
  declarations: [ClickOutsideDirective, DebounceClickDirective],
  exports: [ClickOutsideDirective, DebounceClickDirective],
})
export class DirectivesModule {}
