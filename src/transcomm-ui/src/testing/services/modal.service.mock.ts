/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject } from 'rxjs';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export class MockModalService<_T, _TInput, TOutput> {
  modalOutputdata: Subject<TOutput> = new Subject<TOutput>();

  open(_component, _data = {}): void {
    return;
  }
  close(_output: any): void {
    return;
  }
  getInputData(): any {
    return {};
  }
  createModalInstance(): void {
    return;
  }
}
