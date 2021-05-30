import { Message } from 'discord.js'

import * as Util from '../../utils/util'
import Command from '../../structures/Command'
import TempRoleModel from '../../models/raw/TempRole'
import TempRoom from '../../structures/db/tempRoom/TempRoom'
import { config } from '../../main'

export default class TemproleGiveCommand extends Command {
  get options() {
    return { name: 'личная роль выдать' }
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

    if (targetMember.roles.cache.has(roleDoc.roleID)) return

    let limit = 5
    if (roleDoc.linkedRoomID != null) {
      const tempRoom = await TempRoom.find(roleDoc.linkedRoomID)
      if (tempRoom && tempRoom.slots != null) limit = tempRoom.slots
    }

    const ask = async () => {
      const msg = await message.channel
        .send({
          content: `<@${targetMember.id}>`,
          embed: {
            color: config.meta.defaultColor,
            description: `<@${
              message.author.id
            }> **предлагает** Вам свою личную роль <@&${
              roleDoc.roleID
            }>.\nДля согласия нажмите на ${Util.resolveEmoji(
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

    const customMembers = roleDoc.customMembers || []
    if (!customMembers.includes(targetMember.id)) {
      if (customMembers.length >= limit) return
      TempRoleModel.updateOne(
        { roleID: roleDoc.roleID },
        { $set: { customMembers: customMembers.concat([targetMember.id]) } }
      )
    }

    targetMember.roles.add(roleDoc.roleID)
  }
}
