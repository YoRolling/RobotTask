import { extensionId } from '../constants';

export interface Command {
    name: string;
    key: string;
    method: Function;
}
export function createCommandDecorator(
    registry: Command[]
): (command: string) => Function {
    return (command: string) => __command(registry, command);
}
function __command(registry: Command[], command: string): Function {
    return function(target: any, key: string, descriptor: PropertyDescriptor) {
        if (!(typeof descriptor.value === 'function')) {
            throw new Error('not supported');
        }

        let method;
        method = descriptor.value;

        registry.push({
            name: `${extensionId}.${command}`,
            key: key,
            method: method
        });
    };
}
