import { Collection, Guild, Message, Permissions } from 'discord.js'

import Command from '../../structures/Command'
import TempRoom from '../../structures/db/tempRoom/TempRoom'
import { config } from '../../main'

export default class CloseTemproomCommand extends Command {
  get options() {
    return { name: 'личная комната закрыть' }
  }

  async execute(message: Message) {
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

    const room = guild.channels.cache.get(roomDoc.id)
    if (room) {
      const overwrites = new Collection<
        string,
        { id: string; allow: number; deny: number }
      >()
      for (const overwrite of room.permissionOverwrites.array().map(o => ({
        id: o.id,
        allow: o.allow.bitfield,
        deny: o.deny.bitfield
      }))) {
        overwrites.set(overwrite.id, overwrite)
      }

      const everyonePerms = overwrites.get(guild.id) || { allow: 0, deny: 0 }

      const flags = Permissions.FLAGS.CONNECT
      const referredAllow = everyonePerms.allow & flags
      overwrites.set(guild.id, {
        id: guild.id,
        allow: everyonePerms.allow ^ referredAllow,
        deny: everyonePerms.deny | flags
      })

      room
        .edit({ permissionOverwrites: overwrites, userLimit: 0 })
        .catch(() => {})

      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description:
              'Очень жаль, что вы закрыли для всех доступ к личной комнате.'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
        .catch(() => {})
    }
  }
}
