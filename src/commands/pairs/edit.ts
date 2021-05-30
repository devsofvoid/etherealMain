import { Message } from 'discord.js'

import client, { config } from '../../main'
import Command from '../../structures/Command'
import User from '../../structures/db/User'
import Pair from '../../structures/db/pair/Pair'
import {
  resolveEmoji,
  getReaction,
  confirm,
  discordRetryHandler
} from '../../utils/util'

export default class LeaveCommand extends Command {
  get options() {
    return { name: 'лаврума изменить' }
  }

  get cOptions() {
    return { guildOnly: true }
  }

  async execute(message: Message, args: string[]) {
    const pair = await Pair.find(message.author.id)
    if (!pair) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'У вас нет пары'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const name = args.join(' ')
    if (name.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите название'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const userDoc = await User.get(message.author.id)
    let amount = userDoc.gold >= 1500 ? 1500 : 75
    let currency: 'gold' | 'crystals' =
      userDoc.gold >= 1500 ? 'gold' : 'crystals'
    if (userDoc.gold >= 1500 && userDoc.crystals >= 75) {
      const msg = await message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: [
              'Выберите валюту, которой хотели бы расплатиться',
              '',
              `${(1500).toLocaleString('ru-RU')}${resolveEmoji(
                config.emojis.gold
              )}`.trim(),
              `${(75).toLocaleString('ru-RU')}${resolveEmoji(
                config.emojis.crystal
              )}`.trim()
            ].join('\n')
          }
        })
        .catch(() => {})
      if (!msg) return

      const emojis = [config.emojis.gold, config.emojis.crystal]
      const reaction = await getReaction(msg, emojis, [message.author])
      msg.delete().catch(() => {})
      if (!reaction) return

      const emojiID = reaction.emoji.id || reaction.emoji.name
      amount = emojiID === config.emojis.gold ? 1500 : 75
      currency = emojiID === config.emojis.gold ? 'gold' : 'crystals'
    }

    if (!amount || !currency) {
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

    const msg = await message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: [
            '**Подтвердите действие**',
            `С вашего счета будет списано ${amount.toLocaleString(
              'ru-RU'
            )}${resolveEmoji(
              currency === 'gold' ? config.emojis.gold : config.emojis.crystal
            )}`.trim()
          ].join('\n')
        }
      })
      .catch(() => {})
    if (!msg) return

    const res = await confirm(msg, message.author)
    msg.delete().catch(() => {})
    if (!res) return

    userDoc.update({ [currency]: userDoc[currency] - amount })
    discordRetryHandler(`channels/${pair.room.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${client.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })

    message.channel.send({
      embed: {
        color: config.meta.defaultColor,
        description: 'Поздравляю, название лаврумы успешно изменено!'
      }
    })
  }
}
