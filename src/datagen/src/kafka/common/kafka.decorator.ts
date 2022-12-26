/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const SUBSCRIBER_MAP = new Map();
export const SUBSCRIBER_OBJECT_MAP = new Map();
export const SCHEMAS = new Map();

export function SubscribeTo(topic: string) {
  return (
    target: { [x: string]: any },
    propertyKey: string | number,
    descriptor: any,
  ) => {
    const originalMethod = target[propertyKey];
    SUBSCRIBER_MAP.set(topic, originalMethod);
    return descriptor;
  };
}
