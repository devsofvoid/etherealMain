import { Event } from 'discore.js'
import { TextChannel } from 'discord.js'
import client, { config } from '../main'

export default class extends Event {
  get options() {
    return { name: 'raw' }
  }

  async run(packet: { [K: string]: any }) {
    if (packet.t !== 'MESSAGE_REACTION_ADD') return
    if (packet.d.channel_id !== config.ids.channels.text.valentineRequests) {
      return
    }

    const emojiID = packet.d.emoji.id || packet.d.emoji.name
    if (!config.meta.confirmEmojis.includes(emojiID)) return

    const user = await client.users.fetch(packet.d.user_id).catch(() => null)
    if (!user) return
    if (user.bot) return

    const packetChannel = client.channels.cache.get(packet.d.channel_id) as
      | TextChannel
      | undefined
    if (!packetChannel) return

    const message = await packetChannel.messages
      .fetch(packet.d.message_id)
      .catch(() => null)
    if (!message) return

    message.reactions.removeAll().catch(() => {})
    if (emojiID !== config.meta.confirmEmojis[0]) return

    const valentinesChannel = client.channels.cache.get(
      config.ids.channels.text.valentines
    ) as TextChannel | undefined
    if (!valentinesChannel) return

    valentinesChannel.send(message.content || '', { embed: message.embeds[0] })
  }
}
