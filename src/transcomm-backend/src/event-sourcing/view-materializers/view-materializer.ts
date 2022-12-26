import { Injectable } from '@nestjs/common';
import { Type } from 'event-sourcing/utils';
import { IViewMaterializer } from './interfaces';
import { IEvent } from '@nestjs/cqrs';
import { ModuleRef } from '@nestjs/core';
import { ViewMaterializers } from './view-materializers';

@Injectable()
export class ViewMaterializer {
  private instances = new Map<
    Type<IViewMaterializer<IEvent>>,
    IViewMaterializer<IEvent>
  >();

  constructor(private moduleRef: ModuleRef) {}

  async run<T extends IEvent>(event: T): Promise<void> {
    const materializer = ViewMaterializers.get(event.constructor.name);

    if (materializer) {
      if (!this.instances.has(materializer)) {
        this.instances.set(
          materializer,
          this.moduleRef.get(materializer.name, { strict: false }),
        );
      }

      await this.instances.get(materializer)?.handle(event);
    }
  }
}
