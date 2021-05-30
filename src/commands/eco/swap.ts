import { Message } from 'discord.js'

import Command from '../../structures/Command'
import { config } from '../../main'
import User from '../../structures/db/User'

export default class SwapCommand extends Command {
  get options() {
    return { aliases: ['обменять'] }
  }

  execute(message: Message, args: string[]) {
    const amount = parseInt(args.join('').replace(/\D/g, ''))
    if (!Number.isFinite(amount)) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите корректную сумму'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    User.get(message.author.id).then(userDoc => {
      if (userDoc.crystals < amount) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: 'Недостаточно кристаллов'
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      const coefs = Object.entries(config.swapCoefs)
        .map(([k, v]) => [Number(k), v])
        .sort((b, a) => a[0] - b[0])
      const coef = (coefs.find(([k]) => k <= amount) || [])[1] || 24

      userDoc.update({
        crystals: userDoc.crystals - amount,
        gold: userDoc.gold + amount * coef
      })
    })
  }
}
