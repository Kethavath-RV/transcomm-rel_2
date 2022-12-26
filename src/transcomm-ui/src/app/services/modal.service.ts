import {
  ApplicationRef,
  ComponentFactoryResolver, // <-- deprecated but for now better abstraction in a service
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  Type,
} from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService<T, TInput, TOutput> {
  modalOutputdata: Subject<TOutput> = new Subject<TOutput>();
  modaldata!: TInput;
  private componentRef!: ComponentRef<T> | null;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
  ) {}

  async open(component: Type<T>, data: TInput = {} as TInput): Promise<void> {
    if (this.componentRef) {
      setTimeout(() => {
        this.createModalInstance(component, data);
      }, 200);
    } else {
      this.createModalInstance(component, data);
    }
  }

  async close(outputData: TOutput): Promise<void> {
    if (!this.componentRef) {
      return;
    }
    this.modalOutputdata.next(outputData);

    this.appRef.detachView(this.componentRef.hostView);
    this.componentRef.destroy();

    this.componentRef = null;
  }

  getInputData(): TInput {
    return this.componentRef['instance']['data'];
  }
  createModalInstance(component: Type<T>, data: TInput = {} as TInput): void {
    this.modaldata = Object.assign({}, data); // Check this

    this.componentRef = this.componentFactoryResolver
      .resolveComponentFactory<T>(component)
      .create(this.injector);

    this.componentRef.instance['data'] = this.modaldata;

    this.appRef.attachView(this.componentRef.hostView);

    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
  }
}
