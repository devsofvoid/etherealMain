import { VoiceChannel, VoiceState } from 'discord.js'
import { Event } from 'discore.js'

import TempRoom from '../structures/db/tempRoom/TempRoom'
import client, { cachedRooms } from '../main'
import { addPerms, removePerms } from '../utils/util'

export default class extends Event {
  get options() {
    return { name: 'voiceStateUpdate' }
  }

  async run(oldState: VoiceState, newState: VoiceState) {
    const oldChannel = oldState.channelID
      ? (client.channels.cache.get(oldState.channelID) as VoiceChannel)
      : null
    const newChannel = newState.channelID
      ? (client.channels.cache.get(newState.channelID) as VoiceChannel)
      : null

    const [oldTempRoom, newTempRoom] = await Promise.all([
      oldChannel && TempRoom.find(oldChannel.id),
      newChannel && TempRoom.find(newChannel.id)
    ])

    if (Boolean(oldTempRoom) === Boolean(newTempRoom)) return

    //#region Visibility
    if (oldChannel && oldTempRoom && oldChannel.members.size < 1) {
      removePerms(oldChannel, oldChannel.guild.id, { allow: 1024, deny: 0 })
    }

    if (newChannel && newTempRoom && newChannel.members.size < 2) {
      addPerms(newChannel, newChannel.guild.id, { allow: 1024, deny: 0 })
    }
    //#endregion

    //#region Time
    const roomID = (oldTempRoom || newTempRoom || {}).id
    if (roomID == null) return

    const cacheTime = cachedRooms.get(roomID)

    if (
      cacheTime != null &&
      oldChannel &&
      oldTempRoom &&
      oldChannel.members.size < 2
    ) {
      cachedRooms.delete(roomID)
      const time = Date.now() - cacheTime
      oldTempRoom.update({ voiceTime: oldTempRoom.voiceTime + time })
    }

    if (
      cacheTime == null &&
      newChannel &&
      newTempRoom &&
      newChannel.members.size < 3
    ) {
      cachedRooms.set(roomID, Date.now())
    }
    //#endregion
  }
}
