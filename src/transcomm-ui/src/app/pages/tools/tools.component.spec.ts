import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { ToolsService } from '../../services/tools.service';

import { ToolsComponent } from './tools.component';

class MockToolsService {
  generateSecrets = (): Observable<any> => {
    // trigger refresh here?
    return of(true);
  };
}

describe('ToolsComponent', () => {
  let component: ToolsComponent;
  let fixture: ComponentFixture<ToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: ToolsService, useClass: MockToolsService }],
      declarations: [ToolsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
