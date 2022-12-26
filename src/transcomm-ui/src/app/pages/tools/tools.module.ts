import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToolsService } from '../../services/tools.service';
import { ToolsComponent } from './tools.component';

@NgModule({
  declarations: [ToolsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ToolsComponent,
      },
    ]),
  ],
  providers: [ToolsService],
})
export class ToolsModule {}
