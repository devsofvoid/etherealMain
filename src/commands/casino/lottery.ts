import { Message } from 'discord.js'

import Command from '../../structures/Command'
import UserModel from '../../models/raw/User'
import { config } from '../../main'

export default class LotteryCommand extends Command {
  async execute(message: Message) {
    const aggregationRes = await UserModel.collection
      .aggregate(
        [
          { $project: { _id: 0, inventory: { $ifNull: ['$inventory', {}] } } },
          {
            $project: {
              lottery: { $ifNull: [`$inventory.${config.ids.goods.ticket}`, 0] }
            }
          },
          { $match: { $expr: { $gt: ['$lottery', 0] } } },
          { $count: 'count' }
        ],
        { allowDiskUse: true }
      )
      .toArray()

    const count = (aggregationRes[0] || {}).count || 0
    message.channel.send({
      embed: {
        color: config.meta.defaultColor,
        title: '⠀⠀⠀⠀ЛОТЕРЕЯ | ETHEREAL⠀⠀⠀⠀',
        description: `Скуплено уже ${count.toLocaleString(
          'ru-RU'
        )} лотерейных билетов.`,
        image: {
          url:
            'https://cdn.discordapp.com/attachments/787028836725555251/829463685147263037/8edadbbbc3ea0886a7d3073b32ee16f6.gif'
        },
        footer: {
          text:
            'Успей приобрести билетик и возможно ты выйдешь отсюда победителем!'
        }
      }
    })
  }
}
