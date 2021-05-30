import * as moment from 'moment-timezone'
import { VoiceState } from 'discord.js'
import { Event } from 'discore.js'

import { config } from '../main'

export default class extends Event {
  get options() {
    return { name: 'voiceStateUpdate' }
  }

  run(oldState: VoiceState, newState: VoiceState) {
    if (oldState.channelID === newState.channelID) return

    const member = oldState.member || newState.member
    if (!member) return
    if (member.roles.cache.has(config.ids.roles.nightCity)) return

    const hours = moment().tz('Europe/Moscow').hours()
    if (hours > 5) return

    member.roles.add(config.ids.roles.nightCity).catch(() => {})
  }
}
