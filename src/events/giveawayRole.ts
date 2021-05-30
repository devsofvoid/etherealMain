import { Guild } from 'discord.js'
import { Event } from 'discore.js'

import client, { config } from '../main'
import { discordRetryHandler, getMainGuild } from '../utils/util'

export default class extends Event {
  get options() {
    return { name: 'raw' }
  }

  run(packet: { [k: string]: any }) {
    const packetTypes = ['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE']
    if (!packetTypes.includes(packet.t)) return
    if (packet.d.message_id !== config.ids.messages.giveaway) return

    const emojiID = packet.d.emoji.id || packet.d.emoji.name
    if (emojiID !== config.emojis.giveaway) return

    const guild = getMainGuild() as Guild

    const method = packet.t === packetTypes[0] ? 'PUT' : 'DELETE'
    discordRetryHandler(
      `guilds/${guild.id}/members/${packet.d.user_id}/roles/${config.ids.roles.giveaway}`,
      { method, headers: { Authorization: `Bot ${client.token}` } }
    ).catch(() => {})
  }
}
