import { Guild, Message, Permissions } from 'discord.js'

import * as Util from './utils/util'
import client, { config } from './main'
import TempRoomModel from './models/raw/TempRoom'
import TempRoom from './structures/db/tempRoom/TempRoom'
import Pair from './structures/db/pair/Pair'
import TempRoleModel from './models/raw/TempRole'

export interface Item {
  id: number
  name: string
  emojis: string[]
  description?: string
  image?: string
  price: number
  duration?: number
  activate?(
    message: Message,
    args: string[]
  ): Promise<{ ok: boolean; reason?: string }>
}

export const positionEmojis = [
  '749659635241320448',
  '749660008882372679',
  '749660111693152376',
  '749660320410239083',
  '749660509736927282',
  '749660628989378690'
]

export const goods: { [id: string]: Item } = {
  [config.ids.goods.ticket]: {
    id: config.ids.goods.ticket,
    name: 'Лотерейный билет',
    emojis: ['725759916605702155'],
    price: 150
  },
  [config.ids.goods.temprole1d]: {
    id: config.ids.goods.temprole1d,
    name: 'Роль на 1 день',
    emojis: ['725759916110774353'],
    price: 300,
    duration: 8.64e7
  },
  [config.ids.goods.temprole3d]: {
    id: config.ids.goods.temprole3d,
    name: 'Роль на 3 дня',
    emojis: ['725759916647907459'],
    price: 600,
    duration: 2.592e8
  },
  [config.ids.goods.temprole7d]: {
    id: config.ids.goods.temprole7d,
    name: 'Роль на неделю',
    emojis: ['725759916614352906'],
    price: 1000,
    duration: 6.048e8
  },
  // [config.ids.goods.hero7d]: {
  //   id: config.ids.goods.hero7d,
  //   name: 'Hero на неделю',
  //   emoji: '725759916265963520',
  //   price: 1500,
  //   duration: 6.048e8,
  //   async activate(message) {
  //     const roleID = config.ids.roles.hero
  //     const existing = await Temprole.findOne({
  //       userID: message.author.id,
  //       itemID: this.id
  //     })
  //     if (existing) {
  //       return { ok: false, reason: 'У вас уже имеется данная роль' }
  //     }

  //     const guild = Util.getMainGuild() as Guild
  //     guild.members
  //       .fetch(message.author.id)
  //       .then(member => {
  //         member.roles.add(roleID).catch(() => {})
  //         Temprole.insertOne({
  //           userID: message.author.id,
  //           itemID: this.id,
  //           roleID,
  //           endTick: this.duration ? Date.now() + this.duration : undefined
  //         })
  //       })
  //       .catch(() => {})
  //     return { ok: true }
  //   }
  // },
  [config.ids.goods.temproom7d]: {
    id: config.ids.goods.temproom7d,
    name: 'Канал на неделю',
    emojis: ['725759916287197334'],
    price: 1500,
    duration: 6.048e8,
    async activate(message, args = []) {
      const now = Date.now()
      const [count, existing] = await Promise.all([
        TempRoomModel.find({ endTick: { $gt: now } })
          .lean()
          .countDocuments()
          .exec(),
        TempRoomModel.findOne({ userID: message.author.id }).lean().exec()
      ])
      if (count >= 30) {
        return {
          ok: false,
          reason:
            'Глобальное ограничение по количеству комнат достигнуто.\nДождитесь очистки в следующем месяце'
        }
      }
      if (existing) {
        return { ok: false, reason: 'У вас уже имеется личная комната' }
      }

      const name = args.join(' ')
      if (name.trim().length < 1) {
        return { ok: false, reason: 'Укажите корректное название канала' }
      }

      const guild = Util.getMainGuild() as Guild
      const categoryID = config.ids.categories.temprooms
      const configPerms = config.meta.permissions.temproom

      return guild.channels
        .create(name, {
          type: 'voice',
          parent: categoryID,
          permissionOverwrites: [
            ...configPerms.default,
            {
              id: guild.id,
              allow: configPerms.everyone.allow || 0,
              deny: configPerms.everyone.deny || 0
            },
            {
              id: message.author.id,
              allow: configPerms.member.allow || 0,
              deny: configPerms.member.deny || 0
            }
          ]
        })
        .then(channel => {
          TempRoom.create({
            userID: message.author.id,
            itemID: this.id,
            roomID: channel.id,
            slots: config.meta.temproomSlots,
            endTick: this.duration ? Date.now() + this.duration : null
          })
          return { ok: true }
        })
        .catch(() => ({ ok: false, reason: 'Ошибка создания комнаты' }))
    }
  },
  [config.ids.goods.temproomSlot]: {
    id: config.ids.goods.temproom7d,
    name: 'Дополнительный слот к комнате',
    emojis: ['725759916677267578'],
    price: 75,
    async activate(message) {
      const tempRooms = await TempRoom.get(message.author.id)
      const tempRoom = tempRooms[0]
      if (!tempRoom) {
        return { ok: false, reason: 'У вас нет активной личной комнаты' }
      }

      if (tempRoom.slots >= 99) {
        return {
          ok: false,
          reason: 'Ограничение по количеству слотов достигнуто'
        }
      }

      Util.discordRetryHandler(`channels/${tempRoom.id}`, {
        headers: {
          Authorization: `Bot ${client.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_limit: tempRoom.slots + 1 })
      })

      tempRoom.update({ slots: tempRoom.slots + 1 })
      return { ok: true }
    }
  }
}

export const crystalGoods: { [id: string]: Item } = {
  [config.ids.goods.temprole30d]: {
    id: config.ids.goods.temprole30d,
    name: 'Личная роль на месяц',
    emojis: ['725759916253380741'],
    description: 'Посмотрите как он(а) сияет от новой роли!',
    price: 100,
    duration: 2.592e9
  },
  [config.ids.goods.temproom30d]: {
    id: config.ids.goods.temproom30d,
    name: 'Личная комната на месяц',
    emojis: ['725759916400181258'],
    description: 'У кого-то появился свой уютный уголок',
    price: 150,
    duration: 2.592e9,
    async activate(message, args = []) {
      const now = Date.now()
      const [count, existing] = await Promise.all([
        TempRoomModel.find({ endTick: { $gt: now } })
          .lean()
          .countDocuments()
          .exec(),
        TempRoomModel.findOne({ userID: message.author.id }).lean().exec()
      ])
      if (count >= 30) {
        return {
          ok: false,
          reason:
            'Глобальное ограничение по количеству комнат достигнуто.\nДождитесь очистки в следующем месяце'
        }
      }
      if (existing) {
        return { ok: false, reason: 'У вас уже имеется личная комната' }
      }

      const name = args.join(' ')
      if (name.trim().length < 1) {
        return { ok: false, reason: 'Укажите корректное название канала' }
      }

      const guild = Util.getMainGuild() as Guild
      const categoryID = config.ids.categories.temprooms
      const configPerms = config.meta.permissions.temproom

      return guild.channels
        .create(name, {
          type: 'voice',
          parent: categoryID,
          permissionOverwrites: [
            ...configPerms.default,
            {
              id: guild.id,
              allow: configPerms.everyone.allow || 0,
              deny: configPerms.everyone.deny || 0
            },
            {
              id: message.author.id,
              allow: configPerms.member.allow || 0,
              deny: configPerms.member.deny || 0
            }
          ]
        })
        .then(channel => {
          TempRoom.create({
            userID: message.author.id,
            itemID: this.id,
            roomID: channel.id,
            slots: config.meta.temproomSlots,
            endTick: this.duration ? Date.now() + this.duration : null
          })
          return { ok: true }
        })
        .catch(() => ({ ok: false, reason: 'Ошибка создания комнаты' }))
    }
  },
  [config.ids.goods.roomWithRole30d]: {
    id: config.ids.goods.roomWithRole30d,
    name: 'Комната с ролью на месяц',
    emojis: ['725759916400181258', '726568359872954458', '725759916253380741'],
    description: 'Осталось только посадить дерево!',
    price: 250,
    duration: 2.592e9,
    async activate(message, args = []) {
      const now = Date.now()
      const [count, existing] = await Promise.all([
        TempRoomModel.find({ endTick: { $gt: now } })
          .lean()
          .countDocuments()
          .exec(),
        TempRoomModel.findOne({ userID: message.author.id }).lean().exec()
      ])
      if (count >= 30) {
        return {
          ok: false,
          reason:
            'Глобальное ограничение по количеству комнат достигнуто.\nДождитесь очистки в следующем месяце'
        }
      }
      if (existing) {
        return { ok: false, reason: 'У вас уже имеется личная комната' }
      }

      const colorArg = args.length < 2 ? '' : args.slice(-1)[0]
      const hexColor = Util.resolveHex(colorArg)
      const color = hexColor ? parseInt(hexColor, 16) : undefined

      const guild = Util.getMainGuild() as Guild

      const name = args.slice(...(hexColor ? [0, -1] : [0])).join(' ')
      const temproles = guild.roles.cache.get(config.ids.roles.temproles)

      if (name.trim().length < 1) {
        return { ok: false, reason: 'Укажите корректное название' }
      }

      if (color == null) {
        const confirmMsg = await message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: 'Вы не указали цвет роли. Вы уверены?'
            }
          })
          .catch(() => {})
        if (!confirmMsg) return { ok: false, reason: 'Действие отменено' }

        const confirmRes = await Util.confirm(
          confirmMsg,
          message.author,
          config.meta.temproleNoColorConfirmLimit
        )
        confirmMsg.delete().catch(() => {})
        if (!confirmRes) return { ok: false, reason: 'Действие отменено' }
      }

      const role = await guild.roles
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
        .catch(() => null)
      if (!role) return { ok: false, reason: 'Ошибка создания роли' }

      Util.discordRetryHandler(
        `guilds/${guild.id}/members/${message.author.id}/roles/${role.id}`,
        { method: 'PUT', headers: { Authorization: `Bot ${client.token}` } }
      )

      const categoryID = config.ids.categories.temprooms
      const configPerms = config.meta.permissions.temproom

      return guild.channels
        .create(name, {
          type: 'voice',
          parent: categoryID,
          permissionOverwrites: [
            ...configPerms.default,
            {
              id: role.id,
              allow: Permissions.FLAGS.CONNECT,
              deny: 0
            },
            {
              id: guild.id,
              allow: configPerms.everyone.allow || 0,
              deny: configPerms.everyone.deny || 0
            },
            {
              id: message.author.id,
              allow: configPerms.member.allow || 0,
              deny: configPerms.member.deny || 0
            }
          ]
        })
        .then(channel => {
          TempRoleModel.create({
            userID: message.author.id,
            itemID: config.ids.goods.temprole30d,
            roleID: role.id,
            endTick: this.duration ? Date.now() + this.duration : null,
            customMembers: [],
            linkedRoomID: channel.id
          })

          TempRoom.create({
            userID: message.author.id,
            itemID: this.id,
            roomID: channel.id,
            slots: config.meta.temproomSlots,
            endTick: this.duration ? Date.now() + this.duration : null,
            linkedRoleID: role ? role.id : null
          })
          return { ok: true }
        })
        .catch(() => {
          role.delete().catch(() => {})
          return { ok: false, reason: 'Ошибка создания комнаты' }
        })
    }
  },
  [config.ids.goods.oneNitro30d]: {
    id: config.ids.goods.oneNitro30d,
    name: 'OneNitro подписка на месяц',
    emojis: ['697231507768475678'],
    description: 'Ты уже на один шаг ближе к богатству!',
    image: 'https://i.imgur.com/WzmW2yV.gif',
    price: 250,
    duration: 2.592e9,
    async activate(message) {
      const roleID = config.ids.roles.hero
      const existing = await TempRoleModel.findOne({
        userID: message.author.id,
        itemID: this.id
      })
      if (existing) {
        return {
          ok: false,
          reason: 'У вас уже имеется активная подписка OneNitro!'
        }
      }
      const guild = Util.getMainGuild() as Guild
      guild.members
        .fetch(message.author.id)
        .then(member => {
          member.roles.add(roleID).catch(() => {})
          TempRoleModel.create({
            userID: message.author.id,
            itemID: this.id,
            roleID,
            endTick: this.duration ? Date.now() + this.duration : null,
            customMembers: null,
            linkedRoomID: null
          })
        })
        .catch(() => {})
      return { ok: true }
    }
  },
  [config.ids.goods.loveroomRole]: {
    id: config.ids.goods.loveroomRole,
    name: 'Роль к лавруме',
    emojis: ['725759916001984523'],
    description:
      'Вы идеально смотритесь вместе, многие вам могут только позавидовать!',
    image: 'https://i.imgur.com/0QN9VXq.gif',
    price: 100,
    async activate(message) {
      const pair = await Pair.find(message.author.id)
      if (!pair) return { ok: false, reason: 'Лаврума не найдена' }
      if (pair.roleCount > 0) {
        return {
          ok: false,
          reason:
            'У вашей пары есть доступная роль, активируйте её с помощью команды !парная роль создать'
        }
      }

      pair.update({ roleCount: pair.roleCount + 1 })
      return { ok: true }
    }
  },
  [config.ids.goods.hero]: {
    id: config.ids.goods.hero,
    name: 'Hero навсегда',
    emojis: ['725759916157173761'],
    description: 'Среди смертных, чувствуешь свою власть?',
    price: 300,
    async activate(message) {
      const guild = Util.getMainGuild() as Guild

      const url = `guilds/${guild.id}/members/${message.author.id}/roles/${config.ids.roles.hero}`
      Util.discordRetryHandler(url, {
        method: 'PUT',
        headers: { Authorization: `Bot ${client.token}` }
      })
      return { ok: true }
    }
  },
  [config.ids.goods.donateTempRoomSlot]: {
    id: config.ids.goods.donateTempRoomSlot,
    name: 'Дополнительный слот к комнате',
    emojis: ['725759916677267578'],
    description: 'Твой домик стал больше!',
    price: 15,
    async activate(message) {
      const tempRooms = await TempRoom.get(message.author.id)
      const tempRoom = tempRooms[0]
      if (!tempRoom) {
        return { ok: false, reason: 'У вас нет активной личной комнаты' }
      }

      if (tempRoom.slots >= 99) {
        return {
          ok: false,
          reason: 'Ограничение по количеству слотов достигнуто'
        }
      }

      Util.discordRetryHandler(`channels/${tempRoom.id}`, {
        headers: {
          Authorization: `Bot ${client.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_limit: tempRoom.slots + 1 })
      })

      tempRoom.update({ slots: tempRoom.slots + 1 })
      return { ok: true }
    }
  }
  // [config.ids.goods.clanGoldDoubler]: {
  //   id: config.ids.goods.clanGoldDoubler,
  //   name: 'Удвоение коинов для гильдии',
  //   emojis: ['774229262567079966'],
  //   price: 200
  // }
}
