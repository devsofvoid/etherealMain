import { Event } from 'discore.js'
import { Message, TextChannel } from 'discord.js'

import { VerificationMessage } from '../utils/db'
import { getMainGuild } from '../utils/util'
import client, { config } from '../main'
import VerificationCaptcha from '../models/VerificationCaptcha'

export default class extends Event {
  get options() {
    return { name: 'message' }
  }

  async run(message: Message) {
    if (message.author.bot) return
    if (message.channel.type !== 'dm') return

    const guild = getMainGuild()
    if (!guild) return

    const member = await guild.members
      .fetch(message.author.id)
      .catch(() => null)
    if (!member) return

    if (
      [
        config.ids.roles.gender.female,
        config.ids.roles.gender.male,
        '730204767426707467'
      ].some(id => member.roles.cache.has(id))
    ) {
      return
    }

    const existingMessage = await VerificationMessage.findOne({
      userID: message.author.id
    })
    if (existingMessage) return

    const existingCaptcha = await VerificationCaptcha.findOne({
      user_id: message.author.id,
      status: 0
    })
    if (existingCaptcha) return

    const userCaptchas = await VerificationCaptcha.filter(c => {
      return (
        c.user_id === message.author.id &&
        c.date &&
        c.date > Date.now() / 1e3 - 8.64e4
      )
    })
    const captchaCount = userCaptchas.length
    if (captchaCount > 2) return

    if (message.author.createdTimestamp > Date.now() - 2.592e9) {
      message.author
        .send({
          embed: {
            color: config.meta.defaultColor,
            title: 'Внимание!',
            description:
              'Верификация недоступная для аккаунтов, которые созданы менее 30-дней назад.\nОбратитесь к администрации.'
          }
        })
        .catch(() => {
          const channel = client.channels.cache.get(
            config.ids.channels.text.verification
          ) as TextChannel | undefined
          if (channel) {
            channel
              .send(`<@${message.author.id}>`, {
                embed: {
                  color: config.meta.defaultColor,
                  description:
                    'Мне не удалось достучаться в личные сообщения!\nПроверь свои настройки, может быть ты запер свой домик командой: "Запретить личные сообщения от участников"'
                }
              })
              .then(msg => msg.delete({ timeout: 4.32e7 }))
              .catch(() => {})
          }
        })
      return
    }

    const msg = await message.author
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: '●───────❪⠀ВЕРИФИКАЦИЯ⠀❫───────●',
          description: 'Для доступа к серверу нажмите на реакцию ниже!',
          image: { url: 'https://imgur.com/auiGGZN.gif' },
          footer: {
            text: '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Добро пожаловать на сервер ETHEREAL⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀'
          }
        }
      })
      .catch(() => null)
    if (!msg) {
      const channel = client.channels.cache.get(
        config.ids.channels.text.verification
      ) as TextChannel | undefined
      if (channel) {
        channel
          .send(`<@${message.author.id}>`, {
            embed: {
              color: config.meta.defaultColor,
              description:
                'Мне не удалось достучаться в личные сообщения!\nПроверь свои настройки, может быть ты запер свой домик командой: "Запретить личные сообщения от участников"'
            }
          })
          .then(msg => msg.delete({ timeout: 4.32e7 }))
          .catch(() => {})
      }
      return
    }

    VerificationMessage.insertOne({
      userID: message.author.id,
      messageID: msg.id,
      channelID: msg.channel.id,
      emoji: config.emojis.verification.id
    })

    msg.react(config.emojis.verification.id).catch(() => {})
  }
}
