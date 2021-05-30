import { Message, MessageEmbedOptions } from 'discord.js'

import Command from '../../structures/Command'
import User from '../../structures/db/User'

import { goods } from '../../goods'
import { config } from '../../main'
import { resolveEmoji } from '../../utils/util'

const emojis = [
  '<:one:749659635241320448>',
  '<:two:749660008882372679>',
  '<:three:749660111693152376>',
  '<:four:749660320410239083>',
  '<:five:749660509736927282>',
  '<:six:749660628989378690>'
]

export default class TempShopCommand extends Command {
  async execute(message: Message) {
    const user = await User.get(message.author.id)

    const embed: MessageEmbedOptions = {
      color: config.meta.defaultColor,
      author: {
        name: message.author.tag,
        icon_url: message.author.displayAvatarURL({ dynamic: true })
      },
      title: `\`⠀⠀⠀⠀⠀⠀⠀⠀Магазин временных привилегий⠀⠀⠀⠀⠀⠀⠀⠀\``,
      image: {
        url:
          'https://trello-attachments.s3.amazonaws.com/5f4b6e08c724c15f7bdc96ac/800x300/be3aa9220715c6e2d74486ba464907c0/magazin_lvl.gif'
      },
      footer: { text: `Баланс • ${user.gold.toLocaleString('ru-RU')}` }
    }
    // embed.fields = [
    //   [{ name: '`⠀№.⠀`', value: '\u200b', inline: true }],
    //   [{ name: '` Товар `', value: '\u200b', inline: true }],
    //   [{ name: '` Цена `', value: '\u200b', inline: true }]
    // ]
    //   .concat(
    //     Object.values(goods).map((g, i) => [
    //       {
    //         name: '\u200b',
    //         value: emojis[i],
    //         inline: true
    //       },
    //       {
    //         name: '\u200b',
    //         value: `**${g.name} ${g.emojis
    //           .map(e => resolveEmoji(e).trim())
    //           .join(' ')}**`,
    //         inline: true
    //       },
    //       {
    //         name: '\u200b',
    //         value: `\`${g.price.toLocaleString('ru-RU')}\`${resolveEmoji(
    //           config.meta.emojis.cy
    //         ).trim()}`,
    //         inline: true
    //       }
    //     ])
    //   )
    //   .reduce((acc, c) => acc.concat(c), [])

    const goodsArr = Object.values(goods)

    embed.fields = [
      {
        name: '`⠀№.⠀`',
        value: goodsArr.map((_, i) => ` ${emojis[i]}`).join('\n'),
        inline: true
      },
      {
        name: '`               Товар               `',
        value: goodsArr
          .map(g => {
            return `**${g.name} ${g.emojis
              .map(e => resolveEmoji(e).trim())
              .join(' ')}**`
          })
          .join('\n'),
        inline: true
      },
      {
        name: '` Цена `',
        value: goodsArr
          .map(g => {
            return `\`${g.price.toLocaleString('ru-RU')}\`${resolveEmoji(
              config.meta.emojis.cy
            ).trim()}`
          })
          .join('\n'),
        inline: true
      }
    ]

    message.channel.send({ embed }).catch(() => {})
  }
}
