import { Message } from 'discord.js'

import * as Util from '../../utils/util'
import Command from '../../structures/Command'
import TempRoleModel from '../../models/raw/TempRole'
import TempRoom from '../../structures/db/tempRoom/TempRoom'
import { config } from '../../main'

export default class TemproleTakeCommand extends Command {
  get options() {
    return { name: 'личная роль забрать' }
  }

  async execute(message: Message, args: string[]) {
    const { temprole1d, temprole3d, temprole7d, temprole30d } = config.ids.goods
    const temproleGoods = [temprole1d, temprole3d, temprole7d, temprole30d]
    const roleDocs = await TempRoleModel.find({
      userID: message.author.id,
      itemID: { $in: temproleGoods }
    })
      .lean()
      .exec()
    if (roleDocs.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Личная роль не найдена'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const targetMember = await Util.resolveMember(args[0])
    if (!targetMember || message.author.id === targetMember.id) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите участника'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const selectRole = async () => {
      if (roleDocs.length < 2) return roleDocs[0]

      const emojis = config.emojis.numbers
        .slice(0, roleDocs.length)
        .concat(config.emojis.fail.id)
      const selectMsg = await message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: `Выберите личную роль, которую хотите изменить\n\n${roleDocs
              .map((role, i) => {
                return `${Util.resolveEmoji(emojis[i])}<@&${role.roleID}>`
              })
              .join('\n')}`
          }
        })
        .catch(() => null)
      if (!selectMsg) return null

      const res = await Util.getReaction(selectMsg, emojis, message.author)
      selectMsg.delete().catch(() => {})

      if (!res) return null

      const emojiID = res.emoji.id || res.emoji.name
      if (emojiID === config.emojis.fail.id) return null

      const roleDoc = roleDocs[emojis.indexOf(emojiID)]
      return roleDoc || null
    }

    const roleDoc = await selectRole()
    if (!roleDoc) return

    let limit = 5
    if (roleDoc.linkedRoomID != null) {
      const tempRoom = await TempRoom.find(roleDoc.linkedRoomID)
      if (tempRoom && tempRoom.slots != null) limit = tempRoom.slots
    }

    const customMembers = roleDoc.customMembers || []
    if (customMembers.includes(targetMember.id)) {
      if (customMembers.length >= limit) return
      TempRoleModel.updateOne(
        { roleID: roleDoc.roleID },
        {
          $set: {
            customMembers: customMembers.filter(id => id !== targetMember.id)
          }
        }
      )
    }

    if (targetMember.roles.cache.has(roleDoc.roleID)) {
      targetMember.roles.remove(roleDoc.roleID)
    }
  }
}
