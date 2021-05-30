import { Message } from 'discord.js'

import { config } from '../../main'

import Command, { CommandParams } from '../../structures/Command'
import User from '../../structures/db/User'

export default class EventroleCommand extends Command {
  get options() {
    return { name: 'игровые роли' }
  }

  execute(message: Message, _: string[], { guild, member }: CommandParams) {
    User.get(member.id).then(userDoc => {
      userDoc.update({ gameroles: !userDoc.gameroles })

      if (userDoc.gameroles) {
        const roles = Object.values(config.ids.roles.games).filter(id => {
          return member.roles.cache.has(id)
        })
        if (roles.length > 0) member.roles.remove(roles).catch(() => {})
      }

      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            author: {
              name: message.author.tag,
              icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            title: `Игровые роли | ${guild.name}`,
            description: `Вы ${
              !userDoc.gameroles ? 'включили' : 'отключили'
            } выдачу игровых ролей`
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
        .catch(() => {})
    })
  }
}
