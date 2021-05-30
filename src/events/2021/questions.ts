import { Event } from 'discore.js'
import { CronJob } from 'cron'

import { config } from '../../main'

export default class extends Event {
  get options() {
    return { name: 'ready' }
  }

  run() {
    new CronJob(
      '0 */12 * * *',
      () => {},
      null,
      true,
      config.meta.defaultTimezone
    )
  }
}
