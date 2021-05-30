import { Event, Discord } from 'discore.js'
import { Guild, ClientUser, TextChannel } from 'discord.js'
import fetch from 'node-fetch'

import VerificationCaptcha from '../models/VerificationCaptcha'
import client, { config } from '../main'
import * as Util from '../utils/util'
import User from '../structures/db/User'

function formatCaptcha(text: string): string {
  return text.replace(/J/g, 'j').replace(/[O0]/g, 'o').replace(/I/g, 'l')
}

export default class extends Event {
  get options() {
    return { name: 'message' }
  }

  async run(message: Discord.Message) {
    if (message.channel.type !== 'dm') return

    const captcha = await VerificationCaptcha.findOne({
      user_id: message.author.id,
      status: 0
    })
    if (!captcha) return

    const text = message.content
    const answer = captcha.captcha
    if (text.length !== answer.length) return

    const formattedText = formatCaptcha(text)
    const formattedAnswer = formatCaptcha(answer)
    if (formattedText !== formattedAnswer) return

    const guild = Util.getMainGuild() as Guild
    const member = await guild.members.fetch(message.author.id)
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

    const returningRoles = [config.ids.roles.eventBan]
    // const returningRoles = [config.ids.roles.eventBan, config.ids.roles.toxic]

    let genderRole = '730204767426707467'
    const roles: string[] = []
    const userProfile = await User.find(member.id)

    if (userProfile) {
      const genderRoles = [
        config.ids.roles.gender.female,
        config.ids.roles.gender.male
      ]
      const profileGenderRole = userProfile.roles.find(r => {
        return genderRoles.includes(r)
      })
      if (profileGenderRole) genderRole = profileGenderRole

      userProfile.roles
        .filter(r => returningRoles.includes(r))
        .forEach(id => roles.push(id))
    }

    member.roles.set([genderRole].concat(roles)).catch(() => {})

    const clientUser = client.user as ClientUser

    const url = `https://discord.com/api/v8/channels/${message.channel.id}/messages/${captcha.message_id}`
    fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `${clientUser.bot ? 'Bot ' : ''}${client.token}`
      }
    }).catch(() => {})

    captcha.status = 1
    captcha.save()

    const userCaptchas = await VerificationCaptcha.filter(c => {
      return c.user_id === message.author.id
    })
    const captchaCount = userCaptchas.length
    if (captchaCount > 1) return

    const channel = this.client.channels.cache.get(
      config.meta.welcomeChannelID
    ) as TextChannel
    if (!channel) return

    channel
      .send(String(member), {
        embed: {
          color: 0x2f3136,
          title:
            '╸                          Добро пожаловать                          ╺',
          description:
            'Мы очень рады видеть тебя здесь и хотим, чтобы ты замечательно провел время на нашем сервере.\nИменно здесь вложена частичка нашей души и любви, чтобы тебе, наш дорогой друг, здесь понравилось!\n\n<a:Shiny_Star:803329355827904574>также мы настоятельно рекомендуем **ознакомиться** тебе с такими каналами как: <#783818842026672178> и <#737004223232999514>',
          image: { url: 'https://imgur.com/pfCUNBI.gif' },
          footer: { text: 'Приятного времяпровождения!' }
        }
      })
      .then(msg => msg.delete({ timeout: 12e4 }))
      .catch(() => {})
  }
}
