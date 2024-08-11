import { Logger } from '@nestjs/common';

export function LogMethod(): MethodDecorator {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const result = await originalMethod.apply(this, args);
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      Logger.debug(`Method ${propertyKey} execution time: ${executionTime}ms`, target.constructor.name);
      //## Uncomment this if you want to log the arguments passed to the methods.

      //Logger.debug(`Called with arguments: ${JSON.stringify(args)}`, target.constructor.name);
      return result;
    };
    return descriptor;
  };
}
