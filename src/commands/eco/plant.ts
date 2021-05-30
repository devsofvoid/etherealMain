import { Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import { config } from '../../main'

import { Plant } from '../../utils/db'
import User from '../../structures/db/User'

export default class extends Command {
  get options() {
    return { aliases: ['выкинуть'] }
  }

  execute(message: Message, args: string[]) {
    const amountString = args.join('').replace(/\D/g, '')
    if (amountString.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите кол-во золота'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const amount = parseInt(amountString)
    if (!Number.isFinite(amount)) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите корректное кол-во золота для перевода'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    User.get(message.author.id).then(userDoc => {
      if (userDoc.gold < amount) {
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

      Plant.insertOne({ userID: message.author.id, amount, tick: Date.now() })

      userDoc.update({ gold: userDoc.gold - amount })

      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: `Вы выкинули ${amount.toLocaleString(
              'ru-RU'
            )}${Util.resolveEmoji(config.meta.emojis.cy).trim()}`
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
        .catch(() => {})
    })
  }
}
