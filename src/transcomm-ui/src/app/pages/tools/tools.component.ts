import { Component } from '@angular/core';
import { of } from 'rxjs';
import { catchError, first } from 'rxjs/operators';
import { ToolsService } from '../../services/tools.service';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
})
export class ToolsComponent {
  constructor(private toolsService: ToolsService) {}

  onClick() {
    this.toolsService
      .generateSecrets()
      .pipe(
        first(),
        catchError((err) => {
          return of(err);
        }),
      )
      .subscribe((val) => {
        alert(val.message);
      });
  }
}
