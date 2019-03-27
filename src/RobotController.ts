import {
    Disposable,
    workspace,
    window,
    ExtensionContext,
    Terminal,
    WorkspaceFolder
} from 'vscode';
/* tslint:disable-next-line */
const Cache = require('vscode-cache');
import { hash } from './utils/hash';
import { extensionId } from './constants';

const noop = {
    dispose() {}
};
export class RobotController implements Disposable {
    private _disposable: Disposable;
    private _cache: any;
    private currentTerminal: Terminal[];
    constructor(context: ExtensionContext) {
        this._cache = new Cache(context);
        const subscriptions: Disposable[] = [];
        const workspaces = workspace.workspaceFolders;
        if (workspaces !== undefined) {
            console.log(workspaces);
            console.log(workspace.rootPath);
        }
        subscriptions.push(
            workspace.onDidChangeWorkspaceFolders(
                this.onDidChangeWorkspaceFolders,
                this
            )
        );
        this.currentTerminal = this.run();
        this._disposable = Disposable.from(
            ...subscriptions,
            ...this.currentTerminal,
            noop
        );
    }

    public get cache(): any {
        return this._cache;
    }

    async dispose() {
        if (this._disposable) {
            this._disposable.dispose();
        }
    }

    private onDidChangeWorkspaceFolders() {
        this.dispose();
    }

    private showWorkspace() {
        const workspaces = workspace.workspaceFolders;
        if (workspaces === undefined) {
            return Promise.reject([]);
        }
        const names = workspaces.map((wk: WorkspaceFolder) => {
            return wk.uri.fsPath;
        });
        return window
            .showQuickPick(names, {
                canPickMany: true
            })
            .then((items: string[] | undefined) => {
                if (items === undefined) {
                    throw new Error('does not choose any workspaceFolder');
                } else {
                    return items;
                }
            });
    }
    /**
     * @description 配置默认任务
     * @author YoRolling
     * @date 2019-03-25
     * @memberof RobotControllerBase
     */
    public defaultTask() {
        this.showWorkspace().then((uri: string[]) => {
            this.waitForCommand().then((command: string) => {
                uri.forEach(v => this.saveTask(v, command));
                window.showInformationMessage(`We Got It !`);
                this.run();
            });
        });
    }

    private waitForCommand() {
        return window.showInputBox().then(
            (command: string | undefined) => {
                if (command === undefined || command === null) {
                    throw new Error('We Got Undefined');
                }
                const _command = command.trim();
                if (_command !== '') {
                    return _command;
                } else {
                    throw new Error('We Got Undefined');
                }
            },
            (reason: any) => {}
        );
    }

    private saveTask(uri: string, command: string) {
        const _hashID = hash(uri);
        if (_hashID !== undefined) {
            this.cache.put(_hashID, command);
        }
    }

    /**
     * @description 执行默认任务
     * @author YoRolling
     * @date 2019-03-25
     * @returns {Disposable}
     * @memberof RobotControllerBase
     */
    private run(): Terminal[] {
        const workspaces = workspace.workspaceFolders;
        if (workspaces) {
            return workspaces.reduce(
                (prev: Terminal[], wk: WorkspaceFolder) => {
                    const _hashID = hash(wk.uri.fsPath);
                    if (_hashID !== undefined) {
                        const command = this.cache.get(_hashID);
                        if (command !== undefined) {
                            const terminal = window.createTerminal(
                                `${extensionId}-${workspace.name}-AutoTask`
                            );
                            terminal.show();
                            terminal.sendText(command);
                            prev.push(terminal);
                        }
                    }
                    return prev;
                },
                []
            );
        }

        return [];
    }
    /**
     * @description 清理当前workspace的 auto-task
     * @author YoRolling
     * @date 2019-03-25
     * @memberof RobotControllerBase
     */
    public prune() {
        this.showWorkspace().then((uri: string[]) => {
            uri.forEach(v => {
                const _hashID = hash(v);
                if (_hashID !== undefined) {
                    const asyncProcess:
                        | Thenable<any>
                        | false = this.cache.forget(_hashID);
                    if (asyncProcess === false) {
                        window.showInformationMessage(
                            `Project ${uri} has pruned`
                        );
                    } else {
                        asyncProcess.then(() => {
                            window.showInformationMessage(
                                `Project ${uri} has pruned`
                            );
                        });
                    }
                }
            });
        });
    }

    /**
     * @description 终止当前auto-task terminal
     * @author YoRolling
     * @date 2019-03-25
     * @memberof RobotControllerBase
     */
    public stop() {
        if (this.currentTerminal && this.currentTerminal.length > 0) {
            this.currentTerminal.forEach(terminal => {
                terminal.dispose();
            });
        }
    }
}
