import { Type } from 'event-sourcing/utils';
import { IViewMaterializer } from './interfaces';
import { IEvent } from '@nestjs/cqrs';

export class ViewMaterializers {
  private static materializers = new Map<
    string,
    Type<IViewMaterializer<IEvent>>
  >();

  static add(name: string, handler: Type<IViewMaterializer<IEvent>>) {
    ViewMaterializers.materializers.set(name, handler);
  }

  static get(name: string): Type<IViewMaterializer<IEvent>> | undefined {
    return ViewMaterializers.materializers.get(name);
  }
}
