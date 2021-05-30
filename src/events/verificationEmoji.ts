import * as Path from 'path'
import * as fs from 'fs'

import { Event } from 'discore.js'
import { Guild, ClientUser, TextChannel } from 'discord.js'

import client, { config } from '../main'

import * as Util from '../utils/util'

import { VerificationMessage } from '../utils/db'
import FSUtil from '../utils/fs'
import VerificationCaptcha from '../models/VerificationCaptcha'

export default class extends Event {
  get options() {
    return { name: 'raw' }
  }

  async run(packet: { [key: string]: any }) {
    if (!packet) return
    if (!packet.d) return

    const eventNames = ['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE']
    if (!eventNames.includes(packet.t)) return

    const clientUser = client.user as ClientUser
    if (packet.d.user_id === clientUser.id) return

    const verification = await VerificationMessage.findOne({
      messageID: packet.d.message_id
    })
    if (!verification) return

    const emojiID = (packet.d.emoji || {}).id || (packet.d.emoji || {}).name
    if (verification.emoji !== emojiID) return

    const existingCaptcha = await VerificationCaptcha.findOne({
      user_id: packet.d.user_id,
      status: 0
    })
    if (existingCaptcha) return

    const userCaptchas = await VerificationCaptcha.filter(c => {
      return (
        c.user_id === packet.d.user_id &&
        c.date &&
        c.date > Date.now() / 1e3 - 8.64e4
      )
    })
    const captchaCount = userCaptchas.length
    if (captchaCount > 2) return

    const guild = Util.getMainGuild() as Guild
    const member = await guild.members.fetch(packet.d.user_id)
    if (!member) return
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
    if (
      [
        config.ids.roles.gender.female,
        config.ids.roles.gender.male,
        '730204767426707467'
      ].some(id => member.roles.cache.has(id))
    ) {
      return
    }

    const captchasDir = Path.resolve(process.cwd(), 'assets/captchas')
    const captchaFiles = FSUtil.readdir(captchasDir)
    const captchaFile =
      captchaFiles[Math.floor(Math.random() * captchaFiles.length)]
    if (!captchaFile) return console.error('Cannot choose captchaFile')

    const captchaAnswer = captchaFile.split('.')[0]

    VerificationCaptcha.insertOne({
      captcha: captchaAnswer,
      user_id: member.id,
      status: 0,
      date: Math.floor(Date.now() / 1e3)
    })

    const captchaMsg = await member
      .send({
        files: [
          {
            name: 'captcha.png',
            attachment: fs.readFileSync(Path.resolve(captchasDir, captchaFile))
          }
        ],
        embed: {
          color: config.meta.defaultColor,
          image: { url: 'attachment://captcha.png' }
        }
      })
      .catch(() => null)
    if (!captchaMsg) {
      VerificationCaptcha.deleteOne({
        user_id: member.id,
        status: 0,
        captcha: captchaAnswer
      })

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
          .then(msg => msg.delete({ timeout: 6e4 }))
          .catch(() => {})
      }
      return
    }

    VerificationCaptcha.updateOne(
      { user_id: member.id, status: 0, captcha: captchaAnswer },
      { message_id: captchaMsg.id }
    )

    const url = `channels/${verification.channelID}/messages/${verification.messageID}`
    Util.discordRetryHandler(url, {
      method: 'DELETE',
      headers: {
        Authorization: `${clientUser.bot ? 'Bot ' : ''}${client.token}`
      }
    }).catch(() => {})

    VerificationMessage.deleteMany({ userID: packet.d.user_id }).catch(() => {})
  }
}
