import { Message, MessageEmbedOptions } from 'discord.js'

import Command from '../../structures/Command'
import User from '../../structures/db/User'

import { config } from '../../main'
import { crystalGoods } from '../../goods'
import { resolveEmoji } from '../../utils/util'

const emojis = [
  '<:7_:829447490042069082> ',
  '<:8_:829447692995395635>',
  '<:9_:829447792664510474>',
  '<:10:829447915264671864>',
  '<:11:829448023381639179>',
  '<:12:829448128582385684>',
  '<:13:829448272463790150>',
  '<:14:829448380736077854> ',
  '<:15:829448490127196190> '
]

export default class SecondTempShopCommand extends Command {
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
          'https://trello-attachments.s3.amazonaws.com/5f2c64227f1bad69a9378622/5f653e0cdd70aa25b2474152/8186f53980b9231ec95a8a93f999ab01/magazins.gif'
      },
      footer: { text: `Баланс • ${user.crystals.toLocaleString('ru-RU')}` }
    }
    // embed.fields = [
    //   [{ name: '`⠀№.⠀`', value: '\u200b', inline: true }],
    //   [{ name: '` Товар `', value: '\u200b', inline: true }],
    //   [{ name: '` Цена `', value: '\u200b', inline: true }]
    // ]
    //   .concat(
    //     Object.values(crystalGoods).map((g, i) => [
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
    //           config.meta.emojis.donateCy
    //         ).trim()}`,
    //         inline: true
    //       }
    //     ])
    //   )
    //   .reduce((acc, c) => acc.concat(c), [])

    const goodsArr = Object.values(crystalGoods)

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
              config.meta.emojis.donateCy
            ).trim()}`
          })
          .join('\n'),
        inline: true
      }
    ]

    message.channel.send({ embed }).catch(() => {})
  }
}
