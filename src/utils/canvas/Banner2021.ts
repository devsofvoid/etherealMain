import * as moment from 'moment-timezone'

import { Guild } from 'discord.js'
import { Canvas, createCanvas, Image } from 'canvas'

import CanvasUtil from './canvas'

import * as config from '../../config'

import { getMainGuild } from '../util'

export default class CanvasBanner2021 {
  constructor() {
    return CanvasUtil.images.then(async images => {
      const guild = getMainGuild() as Guild

      const time = moment().tz(config.meta.defaultTimezone).locale('ru-RU')
      const memberCount = guild.memberCount

      const bg: Image = images.banner2021.static

      const canvas = createCanvas(bg.width, bg.height)
      const ctx = canvas.getContext('2d')

      const fillText = CanvasUtil.fillText.bind(CanvasUtil, ctx)

      ctx.drawImage(bg, 0, 0)

      const clock = await CanvasBanner2021.makeClock(time)
      ctx.drawImage(clock, 192, 278)

      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      ctx.font = '45px banner2021'
      await fillText(time.format('HH:mm'), 288, 300, 110)

      ctx.font = '45px banner2021'
      await fillText(memberCount.toLocaleString('ru-RU'), 650, 300, 85)

      return canvas.toBuffer()
    })
  }

  private static makeClock(time: moment.Moment) {
    return new this.Clock(time) as Promise<Canvas>
  }

  private static get Clock() {
    return class CanvasClock {
      constructor(time: moment.Moment) {
        return CanvasUtil.images.then(images => {
          const minArrow: Image = images.banner2021.dynamic.minArrow
          const hourArrow: Image = images.banner2021.dynamic.hourArrow

          const mins = time.minutes()
          const hours = time.hours()

          const canvas = createCanvas(minArrow.width, minArrow.height)
          const ctx = canvas.getContext('2d')

          const minAngle = (mins * 6 * Math.PI) / 180

          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate(minAngle)
          ctx.translate(-canvas.width / 2, -canvas.height / 2)

          ctx.drawImage(minArrow, 0, 0)

          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate(-minAngle)
          ctx.translate(-canvas.width / 2, -canvas.height / 2)

          const hourAngle = (hours * 15 * Math.PI) / 180

          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate(hourAngle)
          ctx.translate(-canvas.width / 2, -canvas.height / 2)

          ctx.drawImage(hourArrow, 0, 0)

          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate(-hourAngle)
          ctx.translate(-canvas.width / 2, -canvas.height / 2)

          return canvas
        })
      }
    }
  }
}
