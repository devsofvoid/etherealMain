import { Message, NewsChannel, TextChannel } from 'discord.js'

import client, { config } from '../../main'
import Command from '../../structures/Command'
import Pair from '../../structures/db/pair/Pair'

export default class LeaveCommand extends Command {
  get options() {
    return { name: 'бросить' }
  }
  get cOptions() {
    return { guildOnly: true }
  }

  async execute(message: Message) {
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

    pair.delete()

    const channel = (client.channels.cache.get(
      config.ids.channels.text.mainChat
    ) || message.channel) as TextChannel | NewsChannel
    channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: 'РАССТАВАНИЕ',
          thumbnail: {
            url:
              'https://trello-attachments.s3.amazonaws.com/5f2c64227f1bad69a9378622/5f2d182cbb42e72dbfdd927c/7d8f1cb87ee6b8d9f4e32bbcf16e4efd/ras.gif'
          },
          description: [
            `<@${Array.from(pair.pair)[0]}> и <@${
              Array.from(pair.pair)[1]
            }>, Расставание — великая штука. Кажется, что оно всегда дает больше, чем забирает. Комната была удалена.`,
            '',
            'И такое в жизни случается, ничто не вечно в этом мире, тем более любовь. Встретите еще тех самых любимых людей.'
          ].join('\n')
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
