import { Collection, Guild, Message, Permissions } from 'discord.js'

import * as Util from '../../utils/util'
import Command from '../../structures/Command'
import TempRoom from '../../structures/db/tempRoom/TempRoom'
import { config } from '../../main'

export default class TemproomUnbanCommand extends Command {
  get options() {
    return { name: 'личная комната разбанить' }
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

      const isbanned = (targetPerms.deny.bitfield & flags) > 0

      if (!isbanned) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: 'Участник не заблокирован в вашем личном канале'
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      const permissionOverwrites = new Collection<
        string,
        { id: string; allow: number; deny: number }
      >()
      for (const overwrite of room.permissionOverwrites.values()) {
        permissionOverwrites.set(overwrite.id, {
          id: overwrite.id,
          allow: overwrite.allow.bitfield,
          deny: overwrite.allow.bitfield
        })
      }

      const targetdeny = targetPerms.deny.bitfield
      const denybitfield = targetdeny ^ (targetdeny & flags)

      if (targetPerms.allow.bitfield === 0 && denybitfield === 0) {
        permissionOverwrites.delete(targetMember.id)
      } else {
        permissionOverwrites.set(targetMember.id, {
          id: targetMember.id,
          allow: targetPerms.allow.bitfield,
          deny: denybitfield
        })
      }
      room.edit({ permissionOverwrites }).catch(() => {})
    }

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: `Передумали? Теперь у ${targetMember} снова есть доступ к вашей личной комнате.`
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
