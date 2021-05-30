import { Message, TextChannel } from 'discord.js'
import Command from '../structures/Command'
import client, { config } from '../main'
import * as Util from '../utils/util'

const images = [
  'https://imgur.com/G4ul0MU.png',
  'https://imgur.com/Sm2xIZD.png',
  'https://imgur.com/rpG99aY.png',
  'https://imgur.com/yymqc5B.png',
  'https://imgur.com/o9u6q1V.png',
  'https://imgur.com/tKVEpFE.png',
  'https://imgur.com/QHM30W9.png',
  'https://imgur.com/exFpXgn.png',
  'https://imgur.com/BpQ1yoS.png',
  'https://imgur.com/1zq0lNn.png',
  'https://imgur.com/Pe6QVoV.png',
  'https://imgur.com/jsTZ8gJ.png',
  'https://imgur.com/f2WnyH0.png',
  'https://imgur.com/WNnR57b.png',
  'https://imgur.com/pgYsEiM.png',
  'https://imgur.com/n3gvDaZ.png',
  'https://imgur.com/myHKgSF.png',
  'https://imgur.com/6rZuwH1.png',
  'https://imgur.com/h9r7Nyv.png',
  'https://imgur.com/XlgxBqb.png',
  'https://imgur.com/n2DFSZ0.png',
  'https://imgur.com/LoFI9o5.png',
  'https://imgur.com/GA3ltyP.png',
  'https://imgur.com/c7JqQPb.png'
]

export class sendValentine extends Command {
  get options() {
    return { name: 'отправить валентинку' }
  }

  execute(message: Message, args: string[]) {
    const text = args.join(' ')
    if (text.length < 1) return

    const channel = client.channels.cache.get(
      config.ids.channels.text.valentineRequests
    ) as TextChannel | undefined
    if (!channel) return

    channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: 'Любовная валентинка ♡',
          description: `${text}\n\nОт ${message.author}`,
          thumbnail: { url: images[Math.floor(Math.random() * images.length)] }
        }
      })
      .then(async msg => {
        try {
          for (const emoji of config.meta.confirmEmojis) {
            await Util.react(msg, emoji)
          }
        } catch (e) {
          console.error(e)
        }
      })
      .catch(() => {})
  }
}

export class sendAnonymousValentine extends Command {
  get options() {
    return { name: 'отправить валентинку анонимно' }
  }

  execute(_message: Message, args: string[]) {
    const text = args.join(' ')
    if (text.length < 1) return

    const channel = client.channels.cache.get(
      config.ids.channels.text.valentineRequests
    ) as TextChannel | undefined
    if (!channel) return

    channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: 'Любовная валентинка ♡',
          description: text,
          thumbnail: { url: images[Math.floor(Math.random() * images.length)] }
        }
      })
      .then(async msg => {
        try {
          for (const emoji of config.meta.confirmEmojis) {
            await Util.react(msg, emoji)
          }
        } catch (e) {
          console.error(e)
        }
      })
      .catch(() => {})
  }
}
