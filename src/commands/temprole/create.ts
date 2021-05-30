import { Message } from 'discord.js'

import * as Util from '../../utils/util'
import client, { config } from '../../main'
import Command, { CommandParams } from '../../structures/Command'
import User from '../../structures/db/User'
import TempRoleModel from '../../models/raw/TempRole'

import { crystalGoods, goods } from '../../goods'

const limits = {
  '744794061600456784': 3,
  '741599274579525662': 3,
  '744794551260282911': 3,
  '730204566594912397': 3
}

export default class CreateTemproleCommand extends Command {
  get options() {
    return { name: 'личная роль создать' }
  }

  async execute(
    message: Message,
    args: string[],
    { guild, member }: CommandParams
  ) {
    const { temprole1d, temprole3d, temprole7d, temprole30d } = config.ids.goods
    const temproleGoods = [temprole1d, temprole3d, temprole7d, temprole30d]
    const existingCount = await TempRoleModel.find({
      userID: message.author.id,
      itemID: { $in: temproleGoods }
    })
      .lean()
      .countDocuments()
      .exec()

    const limitKey = Object.keys(limits).find(id => member.roles.cache.has(id))
    const limit =
      (limitKey ? limits[limitKey as keyof typeof limits] : null) || 2

    if (existingCount >= limit) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Достигнут лимит личных ролей!'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const userDoc = await User.get(message.author.id)

    const invTemproles = temproleGoods
      .map(id => ({
        id,
        name: Object.assign({}, goods, crystalGoods)[id].name,
        emojis: Object.assign({}, goods, crystalGoods)[id].emojis,
        count: userDoc.inventory[id] || 0,
        duration: Object.assign({}, goods, crystalGoods)[id].duration
      }))
      .filter(item => item.count > 0)
    if (invTemproles.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'В инвентаре отсутствуют личные роли!'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const colorArg = args.length < 2 ? '' : args.slice(-1)[0]
    const hexColor = Util.resolveHex(colorArg)
    const color = hexColor ? parseInt(hexColor, 16) : undefined
    const name = args.slice(...(hexColor ? [0, -1] : [0])).join(' ')
    const temproles = guild.roles.cache.get(config.ids.roles.temproles)

    if (name.trim().length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите корректное название роли'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (!hexColor) {
      const confirmMsg = await message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Вы не указали цвет роли. Вы уверены?'
          }
        })
        .catch(() => {})
      if (!confirmMsg) return

      const confirmRes = await Util.confirm(
        confirmMsg,
        message.author,
        config.meta.temproleNoColorConfirmLimit
      )
      confirmMsg.delete().catch(() => {})
      if (!confirmRes) return
    }

    let temprole = invTemproles[0]
    if (invTemproles.length > 1) {
      const msg = await message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: [
              'У вас имеются следующие активации в инвентаре. Выберите то, которое хотели бы использовать',
              '',
              invTemproles
                .map(item => {
                  const emoji =
                    item.emojis
                      .map(id => client.emojis.cache.get(id))
                      .filter(Boolean)
                      .join('') ||
                    client.emojis.cache.get(config.emojis.empty) ||
                    ''
                  return `${`${emoji} `.trimLeft()}${item.name}`
                })
                .join('\n')
            ].join('\n')
          }
        })
        .catch(() => {})
      if (!msg) return

      const emojis = invTemproles.map(i => i.emojis[0])
      const reaction = await Util.getReaction(msg, emojis, [message.author])
      msg.delete().catch(() => {})
      if (!reaction) return

      const emojiID = reaction.emoji.id || reaction.emoji.name
      const chosenitem = invTemproles.find(item => item.emojis[0] === emojiID)
      if (!chosenitem) return

      temprole = chosenitem
    }

    userDoc.update({
      inventory: Object.assign({}, userDoc.inventory, {
        [temprole.id]: temprole.count - 1
      })
    })

    guild.roles
      .create({
        data: {
          color,
          name,
          hoist: false,
          mentionable: true,
          permissions: [],
          position: (temproles || {}).position
        }
      })
      .then(role => {
        member.roles.add(role.id)
        TempRoleModel.create({
          userID: member.id,
          itemID: temprole.id,
          roleID: role.id,
          endTick:
            typeof temprole.duration === 'number'
              ? Date.now() + temprole.duration
              : null,
          customMembers: [],
          linkedRoomID: null
        })

        return message.channel.send({
          embed: {
            color: config.meta.defaultColor,
            title: `${Util.resolveEmoji(config.emojis.roles)}Поздравляю!`,
            thumbnail: { url: 'https://i.imgur.com/9clO0NV.gif' },
            description: [
              'Ты успешно создал(-а) личную роль!',
              `> <@&${role.id}>`
            ].join('\n'),
            footer: {
              text: message.author.tag,
              icon_url: guild.iconURL({ dynamic: true }) || undefined
            },
            timestamp: Date.now()
          }
        })
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
