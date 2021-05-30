import { Event } from 'discore.js'
import { GuildMember, TextChannel } from 'discord.js'

import * as Util from '../utils/util'
import client, { config } from '../main'

import { VerificationMessage } from '../utils/db'
import VerificationCaptcha from '../models/VerificationCaptcha'

export default class extends Event {
  get options() {
    return { name: 'guildMemberAdd' }
  }

  async run(member: GuildMember) {
    if (member.user.bot) return
    if (!Util.verifyMainGuild(member.guild.id)) return

    const existingMessage = await VerificationMessage.findOne({
      userID: member.id
    })
    if (existingMessage) {
      Util.discordRetryHandler(
        `channels/${existingMessage.channelID}/messages/${existingMessage.messageID}`,
        { method: 'DELETE' }
      ).catch(() => {})
    }

    member.roles.set([config.ids.roles.gender.null]).catch(() => {})

    const existingCaptcha = await VerificationCaptcha.findOne({
      user_id: member.id,
      status: 0
    })
    if (existingCaptcha) return

    const userCaptchas = await VerificationCaptcha.filter(c => {
      return (
        c.user_id === member.id && c.date && c.date > Date.now() / 1e3 - 8.64e4
      )
    })
    const captchaCount = userCaptchas.length
    if (captchaCount > 2) return

    if (member.user.createdTimestamp > Date.now() - 2.592e9) {
      member
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
              .send(`<@${member.id}>`, {
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

    const msg = await member
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
          .send(`<@${member.id}>`, {
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
      userID: member.id,
      messageID: msg.id,
      channelID: msg.channel.id,
      emoji: config.emojis.verification.id
    })

    msg.react(config.emojis.verification.id).catch(() => {})
  }
}
