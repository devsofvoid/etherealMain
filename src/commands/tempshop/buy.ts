import { Guild, Message } from 'discord.js'

import * as Util from '../../utils/util'
import Command from '../../structures/Command'
import User from '../../structures/db/User'

import { crystalGoods, goods } from '../../goods'
import { config } from '../../main'

export default class BuyCommand extends Command {
  async execute(message: Message, args: string[]) {
    const index = Number(args[0])
    if (!Number.isInteger(index)) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите корректный номер товара'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const item = Object.values(goods).concat(Object.values(crystalGoods))[
      index - 1
    ]
    if (!item) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Товар не найден'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const currency = index > Object.keys(goods).length ? 'crystals' : 'gold'

    const userDoc = await User.get(message.author.id)

    if (userDoc[currency] < item.price) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Недостаточно средств'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (item.id === config.ids.goods.ticket) Util.runLottery()

    const newInventory = Object.assign({}, userDoc.inventory, {
      [item.id]: (userDoc.inventory[item.id] || 0) + 1
    })

    if (item.id === config.ids.goods.oneNitro30d) {
      Object.assign(newInventory, {
        [config.ids.goods.temprole7d]:
          (newInventory[config.ids.goods.temprole7d] || 0) + 1
      })
    }

    userDoc.update({
      [currency]: userDoc[currency] - item.price,
      inventory: newInventory
    })

    const guild = message.guild as Guild
    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: 'Успешная покупка!',
          thumbnail: { url: 'https://i.imgur.com/WzmW2yV.gif' },
          description: [
            `${message.author}, вы приобрели ${item.emojis
              .map(id => Util.resolveEmoji(id))
              .filter(Boolean)
              .join('')}**${item.name}**`,
            'Надеемся увидеть вас в нашем магазине снова!'
          ].join('\n'),
          footer: {
            text: `${
              message.author.tag
            } • стоимость ${item.price.toLocaleString(
              'ru-RU'
            )} ${Util.pluralNoun(
              item.price,
              ...(currency === 'gold'
                ? ['золото', 'золота', 'золота']
                : ['кристал', 'кристалла', 'кристаллов'])
            )}`,
            icon_url: guild.iconURL({ dynamic: true }) || undefined
          },
          timestamp: Date.now()
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
