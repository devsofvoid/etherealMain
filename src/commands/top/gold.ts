import { User as DiscordUser, Message, MessageEmbedOptions } from 'discord.js'

import Command from '../../structures/Command'
import client, { config } from '../../main'
import UserModel from '../../models/raw/User'

export default class GoldTopCommand extends Command {
  get options() {
    return { name: 'топ богачей' }
  }

  execute(message: Message) {
    UserModel.collection
      .aggregate(
        [
          { $project: { _id: 0, userID: 1, gold: 1 } },
          { $sort: { gold: -1 } },
          { $limit: 5 }
        ],
        { allowDiskUse: true }
      )
      .toArray()
      .then(docs => {
        return docs.map(d => ({
          user: client.users.cache.get(d.userID) as DiscordUser,
          doc: d
        }))
      })
      .then(data => {
        const embed: MessageEmbedOptions = {
          color: config.meta.defaultColor,
          description: '```\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀     [Общий топ]```',
          image: { url: 'https://i.imgur.com/Gu1Kdv2.gif' }
        }

        embed.fields = data
          .map((d, i) => [
            {
              name: '```⠀#.⠀```',
              value: `\`\`\`\n${i + 1}.\`\`\``,
              inline: true
            },
            {
              name: '```⠀⠀⠀⠀⠀⠀⠀НИК⠀⠀⠀⠀⠀⠀⠀```',
              value: `\`\`\`\n${d.user ? d.user.tag : d.doc.userID}\`\`\``,
              inline: true
            },
            {
              name: '```⠀⠀⠀⠀БАЛАНС⠀⠀⠀⠀```',
              value: `\`\`\`\n${d.doc.gold.toLocaleString('ru-RU')}\`\`\``,
              inline: true
            }
          ])
          .reduce((acc, c) => acc.concat(c), [])

        message.channel.send({ embed }).catch(() => {})
      })
  }
}
