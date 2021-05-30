import { Event } from 'discore.js'
import { VoiceState, VoiceChannel } from 'discord.js'

import Pair from '../structures/db/pair/Pair'

const pairs = new Map<string, number>()

function voiceLeave(channel: VoiceChannel | null) {
  if (!channel) return

  const joinDate = pairs.get(channel.id)
  if (!joinDate) return

  Pair.find(channel.id).then(pair => {
    if (!pair) return
    if (Array.from(pair.pair).every(id => channel.members.has(id))) return

    pair.update({
      voiceTime: pair.voiceTime + Math.floor((Date.now() - joinDate) / 1e3)
    })
  })
}

function voiceJoin(channel: VoiceChannel | null) {
  if (!channel) return
  if (pairs.has(channel.id)) return

  Pair.find(channel.id).then(pair => {
    if (!pair) return
    if (!Array.from(pair.pair).every(id => channel.members.has(id))) return

    pairs.set(channel.id, Date.now())
  })
}

export default class extends Event {
  get options() {
    return { name: 'voiceStateUpdate' }
  }

  run(oldState: VoiceState, newState: VoiceState) {
    const oldChannel = oldState.channel
    const newChannel = newState.channel

    if ((oldChannel || {}).id === (newChannel || {}).id) return

    voiceLeave(oldChannel)
    voiceJoin(newChannel)
  }
}
