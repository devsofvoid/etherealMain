import { Message } from 'discord.js'

import Command from '../structures/Command'
import client, { config } from '../main'

import { getEmbedCode } from '../utils/util'
import { nil, CustomEmbedData } from '../utils/types'

export default class SayCommand extends Command {
  get cOptions() {
    return {
      suppressArgs: false,
      allowedRoles: config.access.commands.say
    }
  }

  async execute(message: Message, args: string[]) {
    const attachment = message.attachments.first()
    const rawJson = args.join(' ') || (await getEmbedCode(attachment)) || ''

    let json: CustomEmbedData | nil
    try {
      json = JSON.parse(rawJson)
    } catch (err) {
      message
        .reply(`Ошибка обработки: ${err}`)
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
    }
    if (!json) return

    const content = json.content || json.text || json.plainText || ''

    if (typeof json.thumbnail === 'string') {
      json.thumbnail = { url: json.thumbnail }
    }
    if (typeof json.image === 'string') {
      json.image = { url: json.image }
    }

    const emojiRegex = /(?<!<a?):([^:]+):(?!\d+>)/
    json.description = json.description
      ? json.description.replace(new RegExp(emojiRegex.source, 'g'), m => {
          const match = emojiRegex.exec(m)
          if (!match) return m

          const emoji = client.emojis.cache.find(e => e.name === match[1])
          if (!emoji) return m

          return emoji.toString()
        })
      : undefined

    message.channel.send(content, { embed: json }).catch(err => {
      message
        .reply(`Ошибка отправки: ${err}`)
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
    })
  }
}
