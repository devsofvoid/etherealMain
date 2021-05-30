import { Guild, Message, Permissions } from 'discord.js'

import * as Util from '../../utils/util'
import Command from '../../structures/Command'
import TempRoom from '../../structures/db/tempRoom/TempRoom'
import { config } from '../../main'
import TempRoleModel from '../../models/raw/TempRole'

export default class TemproomGivekeyCommand extends Command {
  get options() {
    return { name: 'выдать ключ' }
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
      if (targetPerms.allow.bitfield & flags) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: 'У участника уже имеется ключ к вашей комнате'
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      const keycount = room.permissionOverwrites.array().filter(o => {
        return (
          o.type === 'member' &&
          o.id !== roomDoc.userID &&
          (o.allow.bitfield & flags) > 0
        )
      }).length
      if (keycount >= roomDoc.slots) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: 'Вы превысили ограничение по слотам'
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      const linkedRole = await TempRoleModel.findOne(
        { linkedRoomID: room.id },
        { _id: 0, roleID: 1, customMembers: 1 }
      )
        .lean()
        .exec()

      if (linkedRole) {
        const ask = async () => {
          const msg = await message.channel
            .send({
              content: `<@${targetMember.id}>`,
              embed: {
                color: config.meta.defaultColor,
                description: `<@${
                  message.author.id
                }> **приглашает** Вас в свою личную комнату "**${
                  room.name
                }**" с ролью <@&${
                  linkedRole.roleID
                }>\nДля согласия нажмите на ${Util.resolveEmoji(
                  config.meta.confirmEmojis[0]
                ).trim()}, а для отказа ${Util.resolveEmoji(
                  config.meta.confirmEmojis[1]
                ).trim()}`
              }
            })
            .catch(() => null)
          if (!msg) return null

          return Util.confirm(msg, targetMember.user).then(res => {
            msg.delete().catch(() => {})
            return res
          })
        }

        const answer = await ask()
        if (!answer) return

        const customMembers = linkedRole.customMembers || []
        if (!customMembers.includes(targetMember.id)) {
          TempRoleModel.updateOne(
            { roleID: linkedRole.roleID },
            { $set: { customMembers: customMembers.concat([targetMember.id]) } }
          )
            .lean()
            .exec()
        }

        targetMember.roles.add(linkedRole.roleID).catch(() => {})
      } else {
        room.updateOverwrite(targetMember.id, { CONNECT: true }).catch(() => {})
      }

      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: `Вы дали доступ к личной комнате ${targetMember}.`
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
        .catch(() => {})
    }
  }
}
