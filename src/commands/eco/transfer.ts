import { Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import { config } from '../../main'

import { resolveMember } from '../../utils/util'
import User from '../../structures/db/User'

export default class extends Command {
  get options() {
    return { name: 'give', aliases: ['передать'] }
  }

  async execute(message: Message, args: string[]) {
    const mentionString = args[0]
    if (mentionString.length < 1) {
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

    const targetMember = await resolveMember(args[0])
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

    if (message.author.id === targetMember.id) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Кек :>'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (targetMember.user.bot) return

    const amountString = args.slice(1).join('').replace(/\D/g, '')
    if (amountString.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите кол-во золота для перевода'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const amount = parseInt(amountString)
    if (!Number.isFinite(amount)) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите корректное кол-во золота для перевода'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const promises = [message.author.id, targetMember.id].map(id => {
      return User.get(id)
    })
    const [authorDoc, targetDoc] = await Promise.all(promises)

    if (authorDoc.gold < amount) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Недостаточно золота на счету'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    await authorDoc.update({gold: authorDoc.gold - amount})
    await targetDoc.update({gold: targetDoc.gold + amount})

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: '**Перевод средств!**',
          description: [
            `${message.author}, начисляет **${amount.toLocaleString(
              'ru-RU'
            )}**${Util.resolveEmoji(
              config.meta.emojis.cy
            ).trim()} на счет ${targetMember}`,
            'Видимо, у нас появился новый миллионер! ʕ ᵔᴥᵔ ʔ'
          ].join('\n')
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
