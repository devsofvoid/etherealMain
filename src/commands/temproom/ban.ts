import { Guild, Message, Permissions } from 'discord.js'

import * as Util from '../../utils/util'
import Command from '../../structures/Command'
import TempRoom from '../../structures/db/tempRoom/TempRoom'
import { config } from '../../main'

export default class TemproomBanCommand extends Command {
  get options() {
    return { name: 'личная комната забанить' }
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

    const room = guild.channels.cache.get(roomDoc.id)
    if (room) {
      const flags = Permissions.FLAGS.CONNECT
      const targetPerms = room.permissionOverwrites.get(targetMember.id) || {
        allow: { bitfield: 0 },
        deny: { bitfield: 0 }
      }

      const isinvoice = targetMember.voice.channelID === roomDoc.id
      const isbanned = (targetPerms.deny.bitfield & flags) > 0

      if (!isinvoice && isbanned) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: 'Участник заблокирован в вашем личном канале'
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      if (isinvoice) targetMember.voice.setChannel(null).catch(() => {})
      if (!isbanned) {
        room
          .updateOverwrite(targetMember.id, { CONNECT: false })
          .catch(() => {})
      }

      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: `Вы навсегда ограничили ${targetMember} доступ к вашей личной комнате.`
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
        .catch(() => {})
    }
  }
}
