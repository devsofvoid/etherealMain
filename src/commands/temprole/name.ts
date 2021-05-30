import { Guild, Message } from 'discord.js'

import * as Util from '../../utils/util'
import Command from '../../structures/Command'
import User from '../../structures/db/User'
import TempRoleModel from '../../models/raw/TempRole'
import { config } from '../../main'

export default class DeleteTemproleCommand extends Command {
  get options() {
    return { name: 'личная роль изменить' }
  }

  async execute(message: Message, args: string[]) {
    const guild = message.guild as Guild

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

    const price = config.meta.temproleNamePrice

    const userDoc = await User.get(message.author.id)
    if (userDoc.gold < price) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Недостаточно средств'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const name = args.join(' ')
    if (name.trim().length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите корректное название'
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

    const confirmMsg = await message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: [
            `С вашего счета будет снято ${price.toLocaleString(
              'ru-RU'
            )}${Util.resolveEmoji(config.meta.emojis.cy).trim()}`,
            '',
            'Подтвердите свое действие'
          ].join('\n')
        }
      })
      .catch(() => {})
    if (!confirmMsg) return

    const confirmRes = await Util.confirm(
      confirmMsg,
      message.author,
      config.meta.temproleNameConfirmLimit
    )
    confirmMsg.delete().catch(() => {})
    if (!confirmRes) return

    userDoc.update({ gold: userDoc.gold - price })

    const role = guild.roles.cache.get(roleDoc.roleID)
    if (role) role.edit({ name }).catch(() => {})

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: `${Util.resolveEmoji(config.emojis.roles)}Личная роль!`,
          thumbnail: { url: 'https://i.imgur.com/9clO0NV.gif' },
          description: [
            'Ты успешно изменил(-а) название личной роли',
            '⠀⠀теперь твоя роль стала ещё прекрасней.',
            `> <@&${roleDoc.roleID}>`
          ].join('\n'),
          footer: {
            text: `${message.author.tag} • стоимость ${price.toLocaleString(
              'ru-RU'
            )} ${Util.pluralNoun(price, 'золото', 'золота', 'золота')}`,
            icon_url: guild.iconURL({ dynamic: true }) || undefined
          },
          timestamp: Date.now()
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
