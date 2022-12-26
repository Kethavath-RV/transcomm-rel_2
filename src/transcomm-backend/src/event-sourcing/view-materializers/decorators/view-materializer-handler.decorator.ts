import { IEvent } from '@nestjs/cqrs';
import { ViewMaterializers } from 'event-sourcing';
import { Type } from 'event-sourcing/utils';

export function ViewMaterializerHandler(event: Type<IEvent>) {
  return (target: any) => {
    ViewMaterializers.add(event.name, target);
  };
}
