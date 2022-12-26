import { Component, Input, OnInit } from '@angular/core';
import { DeclarationView } from 'core/viewModels';
import { compareDate } from 'src/app/helpers/sortHelpers';

@Component({
  selector: 'app-declarations',
  templateUrl: './declarations.component.html',
  styleUrls: ['./declarations.component.css'],
})
export class DeclarationsComponent implements OnInit {
  @Input() declarations: DeclarationView[];

  ngOnInit(): void {
    this.declarations.sort((a, b) => {
      return compareDate(a.createdAt, b.createdAt);
    });
  }
}
