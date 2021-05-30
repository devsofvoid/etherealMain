import { Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import { config } from '../../main'

import { Plant } from '../../utils/db'
import User from '../../structures/db/User'

export default class extends Command {
  get options() {
    return { aliases: ['поднять'] }
  }

  execute(message: Message, _: string[]) {
    Plant.getData()
      .then(plants => [...plants.values()])
      .then(plants => {
        if (plants.length < 1) {
          message.channel
            .send({
              embed: {
                color: config.meta.defaultColor,
                description: 'Дропов не найдено'
              }
            })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {})
          return
        }

        User.get(message.author.id).then(userDoc => {
          const amount = plants.reduce((prev, plant) => plant.amount + prev, 0)
          userDoc.update({ gold: userDoc.gold + amount })
          Plant.deleteMany({})

          message.channel
            .send({
              embed: {
                color: config.meta.defaultColor,
                description: `Вы подняли ${amount.toLocaleString(
                  'ru-RU'
                )}${Util.resolveEmoji(config.meta.emojis.cy).trim()}`
              }
            })
            .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
            .catch(() => {})
        })
      })
  }
}
