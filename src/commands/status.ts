import { Message } from 'discord.js'

import Command from '../structures/Command'

import { config } from '../main'
import User from '../structures/db/User'

export default class TestCommand extends Command {
  get cOptions() {
    return { suppressArgs: false }
  }

  execute(message: Message, args: string[]) {
    const status = args.join(' ')
    if (status.length > config.meta.statusLimit) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Ваш статус превышает лимит символов'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    User.get(message.author.id).then(userDoc => {
      userDoc.update({ status: status.length < 1 ? null : status })

      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Статус обновлен!'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
        .catch(() => {})
    })
  }
}
