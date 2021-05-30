import { Message } from 'discord.js'

import * as Util from '../../../utils/util'
import Command, { CommandParams } from '../../../structures/Command'
import Pair from '../../../structures/db/pair/Pair'
import { config } from '../../../main'

export default class CreateTemproleCommand extends Command {
  get options() {
    return { name: 'парная роль создать' }
  }

  async execute(
    message: Message,
    args: string[],
    { guild, member }: CommandParams
  ) {
    const pair = await Pair.find(message.author.id)
    if (!pair) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'У вас нет пары'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const pairID = pair.getPair(message.author.id)
    if (!pairID) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Ошибка: идентификатор пары содержит ошибку'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const pairMember = await guild.members.fetch(pairID).catch(() => null)
    if (!pairMember) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Ваша вторая половинка не найдена на сервере'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (pair.role.endTimestamp != null && pair.role.endTimestamp > Date.now()) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'У вас имеется активная парная роль'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (pair.roleCount < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Нет доступных ролей'
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

    pair.update({ roleCount: pair.roleCount - 1 })
    pair.roleCount -= 1

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
        pair.update({ roleID: role.id, roleEndTick: Date.now() + 2.592e9 })

        member.roles.add(role.id)
        pairMember.roles.add(role.id)

        return message.channel.send({
          embed: {
            color: config.meta.defaultColor,
            title: 'Так-так.. У нас новая пара?',
            description: `Поздравляю, вы создали парную роль на месяц! Живите в любви и радости!\n\n> <@&${role.id}>`,
            thumbnail: { url: 'https://i.imgur.com/dTOodX2.gif' }
          }
        })
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
