import { commands, Disposable } from 'vscode';
import { Container } from './container';
import { Command, createCommandDecorator } from './libs/decorators';

const commandRegistry: Command[] = [];
const command = createCommandDecorator(commandRegistry);

export class Commands implements Disposable {
    private readonly _disposable: Disposable;

    constructor() {
        this._disposable = Disposable.from(
            ...commandRegistry.map(({ name, key, method }) =>
                commands.registerCommand(name, (...args: any[]) =>
                    method.apply(this, args)
                )
            )
        );
    }

    dispose() {
        if (this._disposable) {
            this._disposable.dispose();
        }
    }

    /**
     * @description
     * @author YoRolling
     * @date 2019-03-22
     * @returns
     * @memberof Commands
     */
    @command('task')
    defaultTask() {
        return Container.rc.defaultTask();
    }

    /**
     * @description
     * @author YoRolling
     * @date 2019-03-22
     * @returns
     * @memberof Commands
     */
    @command('prune')
    prune() {
        return Container.rc.prune();
    }

    @command('stop')
    stop() {
        return Container.rc.stop();
    }
}
