import * as moment from 'moment-timezone'
import { Message } from 'discord.js'

import Command from '../../structures/Command'
import Pair from '../../structures/db/pair/Pair'
import User from '../../structures/db/User'

import {
  parseFilteredTimeString,
  resolveChannelID,
  resolveRoleID,
  resolveUserID,
  pluralNoun
} from '../../utils/util'
import { config } from '../../main'

export default class PairProfileCommand extends Command {
  get options() {
    return { name: 'lprofile', aliases: ['инфопара'] }
  }

  async execute(message: Message, args: string[]) {
    const mentionArg = args.join(' ')
    if (mentionArg.length < 1) return

    const id =
      resolveUserID(mentionArg) ||
      resolveChannelID(mentionArg) ||
      resolveRoleID(mentionArg) ||
      message.author.id

    const pair = await Pair.fetchOne({
      $or: [{ pair: id }, { roomID: id }, { roleID: id }]
    })
    if (!pair) return

    const userPromises = Array.from(pair.pair).map(id => User.get(id))
    const users = await Promise.all(userPromises)

    const gold = users.reduce((acc, u) => u.gold + acc, 0)

    const lastPaymentDate = new Date()
    lastPaymentDate.setDate(1)
    lastPaymentDate.setMonth(lastPaymentDate.getMonth() - 1)

    const paymentDate = new Date()
    paymentDate.setDate(1)
    paymentDate.setMonth(
      paymentDate.getMonth() +
        (pair.createdTimestamp > lastPaymentDate.getTime() ? 2 : 1)
    )

    const untilPayment = paymentDate.getTime() - Date.now()

    message.channel.send({
      embed: {
        color: config.meta.defaultColor,
        title: 'Профиль пары',
        description: `\`\`\`css\n[ ${pair.description || 'Не указано'} ]\`\`\``,
        fields: [
          {
            name: 'Пара:',
            value: Array.from(pair.pair.keys())
              .map(id => `<@${id}>`)
              .join('\n'),
            inline: true
          },
          {
            name: 'Регистрация пары:',
            value: `\`\`\`\n${moment(pair.createdTimestamp)
              .tz('Europe/Moscow')
              .locale('ru')
              .format('L')}\`\`\``,
            inline: true
          },
          {
            name: 'Баланс пары:',
            value: `\`\`\`\n${gold.toLocaleString('ru-RU')} ${pluralNoun(
              gold,
              'золото',
              'золота',
              'золота'
            )}\`\`\``,
            inline: true
          },
          {
            name: 'До оплаты осталось',
            value: `\`\`\`\n${
              untilPayment >= 8.64e7
                ? `${Math.floor(untilPayment / 8.64e7)}д.`
                : parseFilteredTimeString(untilPayment)
            }\`\`\``,
            inline: false
          }
        ],
        image: {
          url:
            'https://images-ext-1.discordapp.net/external/mUSQjQ77ztkIliAvB1D5JO1oJQgR1pEdohfaJCaFC64/%3Fwidth%3D864%26height%3D486/https/media.discordapp.net/attachments/778693713139597345/824735375272575006/anime-background-26.png'
        }
      }
    })
  }
}
