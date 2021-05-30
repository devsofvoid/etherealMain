import {
  Guild,
  Message,
  GuildMember,
  NewsChannel,
  TextChannel,
  PermissionOverwriteOptions
} from 'discord.js'

import * as Util from '../../utils/util'
import Command, { CommandParams } from '../../structures/Command'
import client, { activePairOffers, config } from '../../main'
import User from '../../structures/db/User'
import Pair from '../../structures/db/pair/Pair'

function resolveRoomName(member: GuildMember, targetMember: GuildMember) {
  const replacers = {
    nickname(member: GuildMember): string {
      return member.displayName
    }
  }

  let roomname = config.meta.pairroomName
  Object.entries(replacers).forEach(([name, func]) => {
    const regex = new RegExp(`{${name}\\.([12])}`, '')
    roomname = roomname.replace(new RegExp(regex.source, 'g'), m => {
      const match = m.match(regex)
      if (!match) return m

      const mem = match[1] === '1' ? member : targetMember
      return func(mem)
    })
  })

  return roomname
}

function resolveOverwrites(
  guild: Guild,
  members: [GuildMember, GuildMember]
): PermissionOverwriteOptions[] {
  const metaPerms = config.meta.permissions.loveroom

  const overwrites: PermissionOverwriteOptions[] = [
    ...metaPerms.default,
    {
      id: guild.id,
      allow: metaPerms.everyone.allow || 0,
      deny: metaPerms.everyone.deny || 0
    }
  ]
  members.forEach(m => {
    overwrites.push({
      id: m.id,
      allow: metaPerms.member.allow || 0,
      deny: metaPerms.member.deny || 0
    })
  })

  return overwrites
}

export default class PairCommand extends Command {
  get options() {
    return { name: 'пара' }
  }
  get cOptions() {
    return { guildOnly: true }
  }

  async execute(
    message: Message,
    args: string[],
    { guild, member }: CommandParams
  ) {
    const existing = await Pair.find(message.author.id)
    if (existing) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'У тебя уже имеется пара'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (activePairOffers.has(message.author.id)) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'У тебя уже есть активный запрос!'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const targetMember = await Util.resolveMember(args.join(' '))
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

    if (message.author.id === targetMember.id || targetMember.user.bot) {
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

    const genders = [
      config.ids.roles.gender.male,
      config.ids.roles.gender.female
    ]
    let goldCost = config.meta.pairCost
    if (
      !(
        genders.some(g => member.roles.cache.has(g)) &&
        genders.some(g => targetMember.roles.cache.has(g))
      )
    ) {
      goldCost = 7000
    }
    if (
      genders.some(
        g => member.roles.cache.has(g) && targetMember.roles.cache.has(g)
      )
    ) {
      goldCost = 7000
    }
    if (activePairOffers.has(targetMember.id)) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'У данного пользователя уже есть активный запрос!'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const targetPair = await Pair.find(targetMember.id)
    if (targetPair) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'У данного участника уже есть пара'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const userDoc = await User.get(message.author.id)
    if (!userDoc.inventory[config.ids.goods.loveroom]) {
      let amount = userDoc.gold >= goldCost ? goldCost : 150
      let currency: 'gold' | 'crystals' =
        userDoc.gold >= goldCost ? 'gold' : 'crystals'
      if (userDoc.gold >= goldCost && userDoc.crystals >= 150) {
        const msg = await message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: [
                'Выберите валюту, которой хотели бы расплатиться',
                '',
                `${goldCost.toLocaleString('ru-RU')}${Util.resolveEmoji(
                  config.emojis.gold
                )}`.trim(),
                `${(150).toLocaleString('ru-RU')}${Util.resolveEmoji(
                  config.emojis.crystal
                )}`.trim()
              ].join('\n')
            }
          })
          .catch(() => {})
        if (!msg) return

        const emojis = [config.emojis.gold, config.emojis.crystal]
        const reaction = await Util.getReaction(msg, emojis, [message.author])
        msg.delete().catch(() => {})
        if (!reaction) return

        const emojiID = reaction.emoji.id || reaction.emoji.name
        amount = emojiID === config.emojis.gold ? goldCost : 150
        currency = emojiID === config.emojis.gold ? 'gold' : 'crystals'
      }

      if (!amount || !currency) {
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

      if (userDoc[currency] < amount) {
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

      const confirmMsg = await message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            title: 'ПРЕДЛОЖЕНИЕ',
            description: [
              'Я жизни без тебя не представляю, хочу идти с тобой по жизненном пути. Тебя люблю, тебя я обожаю, и делаю тебе я предложения сердца и руки!',
              '',
              `${message.author} отправляет предложение стать парой ${targetMember}, мы в предвкушении новой пары...`
            ].join('\n'),
            image: {
              url:
                'https://trello-attachments.s3.amazonaws.com/5f2d182cbb42e72dbfdd927c/800x369/4c291b6172fca9677bbdf37e1562a42c/predli.gif'
            }
          }
        })
        .catch(() => {})
      if (!confirmMsg) return

      activePairOffers.add(message.author.id)
      activePairOffers.add(targetMember.id)

      const confirm = await Util.confirm(confirmMsg, targetMember.user)

      activePairOffers.delete(message.author.id)
      activePairOffers.delete(targetMember.id)

      confirmMsg.delete().catch(() => {})
      if (!confirm) return

      await userDoc.fetch()
      if (userDoc[currency] < amount) {
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

      userDoc.update({ [currency]: userDoc[currency] - amount })
    } else {
      const confirmMsg = await message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            title: 'ПРЕДЛОЖЕНИЕ',
            description: [
              'Я жизни без тебя не представляю, хочу идти с тобой по жизненном пути. Тебя люблю, тебя я обожаю, и делаю тебе я предложения сердца и руки!',
              '',
              `${message.author} отправляет предложение стать парой ${targetMember}, мы в предвкушении новой пары...`
            ].join('\n'),
            image: {
              url:
                'https://trello-attachments.s3.amazonaws.com/5f2d182cbb42e72dbfdd927c/800x369/4c291b6172fca9677bbdf37e1562a42c/predli.gif'
            }
          }
        })
        .catch(() => {})
      if (!confirmMsg) return

      activePairOffers.add(message.author.id)
      activePairOffers.add(targetMember.id)

      const confirm = await Util.confirm(confirmMsg, targetMember.user)

      activePairOffers.delete(message.author.id)
      activePairOffers.delete(targetMember.id)

      confirmMsg.delete().catch(() => {})
      if (!confirm) return
    }

    const room = await guild.channels
      .create(resolveRoomName(member, targetMember), {
        parent: config.ids.categories.loverooms,
        permissionOverwrites: resolveOverwrites(guild, [member, targetMember]),
        type: 'voice'
      })
      .catch(() => {})
    if (!room) return

    Pair.create({ roomID: room.id, pair: [message.author.id, targetMember.id] })

    const channel = (client.channels.cache.get(
      config.ids.channels.text.mainChat
    ) || message.channel) as TextChannel | NewsChannel
    channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: 'НОВЕНЬКАЯ ПАРА ВЛЮБЛЁННЫХ',
          description: [
            `Дорогие участники сервера, я объявляю, ${message.author} и ${targetMember}, официальной парой этого сервера!`,
            '',
            'Поздравляю вас с созданием собственного любовного домика, долголетия желаю вашей любви, вам – влюбленной паре! Такого долголетия, которое согласно превратиться в вечность.'
          ].join('\n'),
          image: {
            url:
              'https://trello-attachments.s3.amazonaws.com/5f2d182cbb42e72dbfdd927c/800x369/d12729a55b4edf5dcd300f6011d074bd/novaya.gif'
          }
        }
      })
      .then(msg => msg.delete({ timeout: 18e5 }))
      .catch(() => {})
  }
}
