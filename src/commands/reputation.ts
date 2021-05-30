import { Message } from 'discord.js'

import * as Util from '../utils/util'
import { config } from '../main'

import Command, { CommandParams } from '../structures/Command'
import User from '../structures/db/User'

export default class ReputationCommand extends Command {
  get options() {
    return { name: 'репутация' }
  }

  async execute(message: Message, args: string[], { guild }: CommandParams) {
    const authorDoc = await User.get(message.author.id)
    if (
      authorDoc.lastRepTick != null &&
      config.meta.repIntHourly - (Date.now() - authorDoc.lastRepTick) > 0
    ) {
      return message.channel
        .send({
          embed: {
            title: '```⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀РЕПУТАЦИЯ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀```',
            description: `Вам доступная одна репутация раз в **3 часа**! осталось подождать **${
              Util.parseFilteredFullTimeArray(
                config.meta.repIntHourly - (Date.now() - authorDoc.lastRepTick)
              )[0]
            }**.`,
            color: 3092790,
            footer: {
              text: message.author.tag,
              icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date(),
            thumbnail: {
              url:
                'https://cdn.discordapp.com/attachments/578884018045452288/776151307760828456/ethereal.gif'
            }
          }
        })
        .then(() => {})
    }

    const targetMember = await Util.resolveMember(args[0], guild)
    if (!targetMember || targetMember.id === message.author.id) {
      return message.channel
        .send({
          embed: {
            title: '```⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀РЕПУТАЦИЯ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀```',
            description: `Укажите пользователя которому хотите выдать репутацию`,
            color: 3092790,
            footer: {
              text: message.author.tag,
              icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date(),
            thumbnail: {
              url:
                'https://cdn.discordapp.com/attachments/578884018045452288/776151307760828456/ethereal.gif'
            }
          }
        })
        .then(() => {})
    }

    const repUsers = authorDoc.repUsers
    if (
      repUsers &&
      repUsers[targetMember.id] != null &&
      repUsers[targetMember.id] + config.meta.reputationInterval > Date.now()
    ) {
      return message.channel
        .send({
          embed: {
            title: '```⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀РЕПУТАЦИЯ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀```',
            description: `Вы недавно влияли на репутацию данного пользователя.`,
            color: 3092790,
            footer: {
              text: message.author.tag,
              icon_url: 'https://imgur.com/MZwG7J1.gif'
            },
            timestamp: new Date(),
            thumbnail: {
              url: message.author.displayAvatarURL({ dynamic: true })
            }
          }
        })
        .then(() => {})
    }

    if (!config.meta.typeofReputation.includes(args[1])) {
      return message.channel
        .send({
          embed: {
            title: '```⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀РЕПУТАЦИЯ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀```',
            description: `Укажите один из аргументов. Вы можете указать \`+\` или \`-\``,
            color: 3092790,
            footer: {
              text: message.author.tag,
              icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date(),
            thumbnail: {
              url:
                'https://cdn.discordapp.com/attachments/578884018045452288/776151307760828456/ethereal.gif'
            }
          }
        })
        .then(() => {})
    }

    const targetDoc = await User.get(targetMember.id)

    authorDoc.update({
      lastRepTick: Date.now(),
      repUsers: Object.assign({}, repUsers, { [targetMember.id]: Date.now() })
    })
    targetDoc.update({
      reputation: targetDoc.reputation + (args[1] === '-' ? -1 : 1)
    })

    message.channel.send({
      embed: {
        title: '```⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀РЕПУТАЦИЯ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀```',
        description: `Пользователь **${message.author.tag}** ${
          args[1] == '-' ? `испортил репутацию` : `добавил репутацию`
        } **${targetMember.user.tag}**`,
        color: 3092790,
        footer: {
          text: message.author.tag,
          icon_url: message.author.displayAvatarURL({ dynamic: true })
        },
        timestamp: new Date(),
        thumbnail: {
          url:
            'https://cdn.discordapp.com/attachments/578884018045452288/776151307760828456/ethereal.gif'
        }
      }
    })
  }
}
