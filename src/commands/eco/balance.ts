import { Message } from 'discord.js'

import Command, { CommandParams } from '../../structures/Command'
import * as Util from '../../utils/util'
import { config } from '../../main'
import User from '../../structures/db/User'

export default class extends Command {
  get options() {
    return { name: '$' }
  }

  async execute(message: Message, args: string[], { member }: CommandParams) {
    const targetUser = (await Util.resolveMember(args[0])) || member

    User.get(targetUser.id).then(doc => {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            author: {
              name: targetUser.user.username,
              icon_url: targetUser.user.displayAvatarURL({ dynamic: true })
            },
            title: `Счёт пользователя | ${targetUser.user.tag}`,
            thumbnail: { url: 'https://imgur.com/wp3HNDK.gif' },
            fields: [
              {
                // name: 'Золото',
                name: '\u200B',
                value: `${doc.gold.toLocaleString('ru-RU')}${Util.resolveEmoji(
                  config.meta.emojis.cy
                ).trim()}`,
                inline: true
              },
              {
                // name: 'Кристаллы',
                name: '\u200B',
                value: `${doc.crystals.toLocaleString(
                  'ru-RU'
                )}${Util.resolveEmoji(config.meta.emojis.donateCy).trim()}`,
                inline: true
              }
            ]
          }
        })
        .catch(() => {})
    })
  }
}
