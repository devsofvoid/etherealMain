import chalk = require('chalk');
import { Core } from 'discore.js'

export abstract class Service {
    protected core: Core;

    public constructor(core: Core) {
        this.core = core;
    }

    public async init() {
        // NO-OP
    }
    public async onClientReady() {
        this.startupDone();
    }
    protected startupDone() {
        console.log(chalk.green(`All services ready`));
    }
}
