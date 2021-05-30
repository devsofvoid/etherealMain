import { SnowflakeUtil } from 'discord.js'

import { config } from '../main'

export default class Timer {
  static cache = new Map<string, { date: number; fn: () => void }>()
  static lastTick = Date.now()
  static checkInterval = config.meta.checkInterval

  static get nextTick() {
    return Timer.lastTick + Timer.checkInterval
  }

  static set(date: number, fn: () => void) {
    if (Timer.nextTick > date) {
      return Timer.cache.set(SnowflakeUtil.generate(), { date, fn })
    }
    return Timer.timeout(fn, date - Date.now())
  }

  static tick() {
    console.log(Timer.cache)
    
    Timer.lastTick = Date.now()
    for (const [id, val] of Timer.cache) {
      if (val.date <= Timer.nextTick) {
        Timer.timeout(val.fn, val.date - Date.now())
        Timer.cache.delete(id)
      }
    }
    Timer.timeout(Timer.tick, Timer.checkInterval)
  }

  static timeout(fn: () => void, time = 0) {
    return setTimeout(() => fn(), time)
  }
}

Timer.tick()
