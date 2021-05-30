import { Message, MessageEmbed, TextChannel } from 'discord.js'

import { default as client, config } from '../main'
import Command from '../structures/Command'

import { ImgRequest } from '../utils/db'

export default class extends Command {
  get options() {
    return { name: 'предложить новость' }
  }

  async execute(message: Message, args: string[]) {
    if (message.channel.type !== 'dm') return
    const typeArg = args.shift() || ''
    const typeKey = typeArg.toLowerCase() as keyof typeof config.postTypes
    const channelType = config.postTypes[typeKey]
    if (typeof channelType !== 'number') return
    const channelID = config.postChannels[channelType]
    if (!channelID) return
    const channel = client.channels.cache.get(channelID) as TextChannel
    if (!channel) return
    let url: string | null = args.join(' ')
    if (url.length < 1) url = null;
    const attachment = message.attachments.first()
    if (!url && !attachment) return
    url = (attachment || { url }).url
    if (typeof url !== 'string') return
    const embed = new MessageEmbed({
      color: 0x2f3136,
      author: {
        name: message.author.username,
        icon_url: message.author.displayAvatarURL({ dynamic: true })
      },
      image: { url }
    })

    const msg = await channel.send(embed).catch(() => { })
    if (!msg) return

    await ImgRequest.insertOne({ msgID: msg.id, type: channelType, userID: message.author.id })

    message.author
      .send('**Ваш пост отправлен на проверку модерации!**')
      .catch(() => { })

    await msg.react(config.emojis.verification.id).catch(() => { })
    msg.react(config.emojis.fail.id).catch(() => { })
  }
}
