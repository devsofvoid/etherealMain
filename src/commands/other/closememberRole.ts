import { Message } from 'discord.js'

import { config } from '../../main'
import Command, { CommandParams } from '../../structures/Command'

const closememberRoleID = config.ids.roles.closemember

export default class ClosememberRoleCommand extends Command {
  get options() {
    return { name: 'клозмембер', aliases: ['клозроль'] }
  }

  execute(message: Message, _: string[], { guild, member }: CommandParams) {
    const exists = member.roles.cache.has(closememberRoleID)
    member.roles[exists ? 'remove' : 'add'](closememberRoleID).catch(() => {})

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL({ dynamic: true })
          },
          title: `Клоз роль | ${guild.name}`,
          description: `Вы ${
            exists ? 'отключили' : 'включили'
          } выдачу клоз роли`
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
