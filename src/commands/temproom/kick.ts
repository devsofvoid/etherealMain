import { Guild, Message } from 'discord.js'

import * as Util from '../../utils/util'
import Command from '../../structures/Command'
import TempRoom from '../../structures/db/tempRoom/TempRoom'
import { config } from '../../main'

export default class TemproomKickCommand extends Command {
  get options() {
    return { name: 'личная комната кикнуть' }
  }

  async execute(message: Message, args: string[]) {
    const guild = message.guild as Guild

    const roomDocs = await TempRoom.get(message.author.id)
    const roomDoc = roomDocs[0]

    if (!roomDoc) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Личная комната не найдена'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const targetMember = await Util.resolveMember(args[0], guild)
    if (!targetMember) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не найден'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (targetMember.voice.channelID !== roomDoc.id) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не находится в вашей личной комнате'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    targetMember.voice.setChannel(null).catch(() => {})

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: `Вы временно исключаете ${targetMember} от голосового канала вашей личной комнаты. `
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
