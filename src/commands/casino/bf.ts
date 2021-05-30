import { Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import { config } from '../../main'
import User from '../../structures/db/User'

export default class BfCommand extends Command {
  execute(message: Message, args: string[]) {
    User.get(message.author.id).then(userDoc => {
      const betAmount = parseInt((args[0] || '').replace(/\D/g, ''))
      if (!Number.isInteger(betAmount)) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: 'Укажите корректную ставку'
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      const betSubject = (args[1] || '').toLowerCase()
      if (!['t', 'h'].includes(betSubject)) return

      const minbet = config.meta.minbfBet
      const maxbet = config.meta.maxbfBet
      if (betAmount < minbet) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: `Минимальная ставка – ${minbet.toLocaleString(
                'ru-RU'
              )}`
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }
      if (betAmount > maxbet) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: `Максимальная ставка – ${maxbet.toLocaleString(
                'ru-RU'
              )}`
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      if (userDoc.gold < betAmount) {
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

      // const randres = Math.floor(Math.random() * 2)

      const scndRandom = Math.floor(Math.random() * (100 - 1 + 1)) + 1
      let win = scndRandom < 20 ? true : false
      const winAmount = Math.floor(betAmount * (win ? 1 : -1))

      const correctSubj = (betSubject === 't' ? ['h', 't'] : ['t', 'h'])[
        Number(win)
      ]

      userDoc.update({ gold: userDoc.gold + winAmount })

      message.channel.send({
        embed: {
          color: win ? config.meta.bfWinColor : config.meta.bfLoseColor,
          author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL({ dynamic: true })
          },
          thumbnail: {
            url: [
              'https://imgur.com/By8B5TY.png',
              'https://i.imgur.com/0ibdq9g.png'
            ][Number(correctSubj === 't')]
          },
          description: (win
            ? [
                '**угадал сторону монетки**',
                `> ты получаешь ${Util.pluralNoun(
                  winAmount,
                  '',
                  'свои',
                  'свои'
                )} ${winAmount.toLocaleString('ru-RU')}${Util.resolveEmoji(
                  config.meta.emojis.cy
                ).trim()} ${Util.pluralNoun(
                  winAmount,
                  'чеканную монету',
                  'чеканные монеты',
                  'чеканных монет'
                )}!`
              ]
            : ['**ты проиграл :(**', '> удача не на твоей стороне....']
          ).join('\n')
        }
      })
    })
  }
}
