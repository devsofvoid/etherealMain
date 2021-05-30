import { Message } from 'discord.js'

import { config } from '../../main'

import Command, { CommandParams } from '../../structures/Command'
import User from '../../structures/db/User'

const roles: (keyof typeof config.ids.roles.games)[] = [
  'Osu!',
  'Counter-Strike: Global Offensive',
  'Dota 2',
  "PLAYERUNKNOWN'S BATTLEGROUNDS",
  'Valorant',
  'Minecraft',
  'Brawlhalla',
  'Among Us',
  'Overwatch',
  'Genshin Impact',
  'League of Legends'
]

export default class EventroleCommand extends Command {
  get options() {
    return { name: 'игровая роль' }
  }

  execute(message: Message, args: string[], { member }: CommandParams) {
    User.get(member.id).then(userDoc => {
      if (!userDoc.gameroles) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description:
                'Сперва необходимо включить функцию. Для активации используйте команду `!игровые роли`'
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      const selectedArr = args.map(a => roles[Number(a) - 1]).filter(Boolean)
      const selected = new Set(selectedArr)
      if (selected.size < 1) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
              },
              title: 'Справочник по игровым ролям',
              description: `\`!игровая роль 1\` - добавить роль.\n\`!игровая роль 1 2 3 4\` - добавить несколько ролей за раз.\n\`!игровые роли\` - убрать все игровые роли.\n\n**Список доступных ролей:**\n\`\`\`ini\n${roles
                .map((key, i) => `[${i + 1}] ${key}`)
                .join('\n')}\`\`\``
            }
          })
          .catch(() => {})
        return
      }

      const newRoles = new Set(member.roles.cache.keys())
      Array.from(selected)
        .map(key => config.ids.roles.games[key])
        .forEach(id => newRoles[newRoles.has(id) ? 'delete' : 'add'](id))

      member.roles.set(Array.from(newRoles)).catch(() => {})
    })
  }
}
