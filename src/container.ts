'use strict';
import { ExtensionContext } from 'vscode';
import { Commands } from './commands';
import { RobotController } from './RobotController';

export class Container {
    static initialize(context: ExtensionContext) {
        this._context = context;
        context.subscriptions.push((this._rc = new RobotController(context)));
        context.subscriptions.push((this._commands = new Commands()));
    }

    private static _commands: Commands;
    static get commands() {
        return this._commands;
    }

    private static _context: ExtensionContext;
    static get context() {
        return this._context;
    }

    private static _rc: RobotController;
    static get rc() {
        return this._rc;
    }
}
