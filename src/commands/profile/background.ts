import { Message, TextChannel } from 'discord.js'

import Book from '../../structures/Book'
import Command from '../../structures/Command'

import { config } from '../../main'
import { Page } from '../../structures/Book'
import User from '../../structures/db/User'

const backgrounds: { [key: number]: any } = {
  1: {
    price: 333,
    donate: false,
    author: {
      name: 'Бумажная текстура • 333 золота',
      icon_url: 'https://imgur.com/MGrk8c8.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476155291959326/25NOJ-Immanuel_solid_6.jpg?width=520&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Бумажная текстура [ 333 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value: '```Обычная бумажная текстура характеризующие серые оттенки.```',
        inline: true
      }
    ]
  },
  2: {
    price: 1333,
    donate: false,
    author: {
      name: 'Туманный лес • 1333 золота',
      icon_url: 'https://imgur.com/lwdB5Nc.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476068951949332/les_derevya_tuman_110131_3840x2160.jpg?width=924&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Туманный лес [ 1333 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Туманный лес, или Моховой лес, или Нефелогилея, или тропический горный туманный лес — обычно представляет собой влажный тропический или субтропический горный вечнозелёный лес.```',
        inline: true
      }
    ]
  },
  3: {
    price: 677,
    donate: false,
    author: {
      name: 'Бумажная текстура • 677 золота',
      icon_url: 'https://imgur.com/lwdB5Nc.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476080637542400/SNPBT0816_Dreamn4everDesigns_p1.jpg?width=520&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Текстура [ 677 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Необычная бумажная текстура характеризующие утонченность.```',
        inline: true
      }
    ]
  },
  4: {
    price: 777,
    donate: false,
    author: {
      name: 'Любовная текстура  • 777 золота',
      icon_url: 'https://imgur.com/34FzjFI.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476124812214302/hearty.jpg?width=520&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Любовная текстура [ 777 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Сердечно любовная текстура, характеризующая спокойствие и приятные розовые оттенки.```',
        inline: true
      }
    ]
  },
  5: {
    price: 2444,
    donate: false,
    author: {
      name: 'Облака  • 2444 золота',
      icon_url: 'https://imgur.com/lwdB5Nc.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476074580574256/pero-kalimero-9BJRGlqoIUk-unsplash.jpg?width=780&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Большие облака [ 2444 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Большие облака характеризующие необычную атмосферу и нелетную погоду.```',
        inline: true
      }
    ]
  },
  6: {
    price: 200,
    donate: true,
    author: {
      name: 'Звездопад  • 200 кристаллов',
      icon_url: 'https://imgur.com/EbJ9SVq.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476166268715028/1866.jpg?width=938&height=417',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Звездопад [ 200 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value: '```Иллюстрация красивого звездопада на заброшенной планете.```',
        inline: true
      }
    ]
  },
  7: {
    price: 100,
    donate: true,
    author: {
      name: 'Атмосферная Япония  • 100 кристаллов',
      icon_url: 'https://imgur.com/deCpkUh.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476114741297172/derive-japan-cody-ellingham.jpg?width=924&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Атмосферный фон [ 100 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Тёмная атмосферная Япония показывающие величия красных оттенков.```',
        inline: true
      }
    ]
  },
  8: {
    price: 1555,
    donate: false,
    author: {
      name: 'Котик  • 1555 золота',
      icon_url: 'https://imgur.com/lwdB5Nc.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476074618322974/Lovely-cat-sleeping-pet_3840x2160.jpg?width=924&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Котик [ 1555 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Милый рыжий барсик спящий на пуфике, атмосферно смотрящийся на любом фоне.```',
        inline: true
      }
    ]
  },
  9: {
    price: 200,
    donate: true,
    author: {
      name: 'Текстурные волны • 200 кристаллов',
      icon_url: 'https://imgur.com/deCpkUh.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476095128862750/wave.jpg?width=520&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Текстурные волны [ 200 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value: '```Векторная иллюстрация текстуры — напоминающая волны.```',
        inline: true
      }
    ]
  },
  10: {
    price: 200,
    donate: true,
    author: {
      name: 'Дракон • 200 кристаллов',
      icon_url: 'https://imgur.com/IlOoBOr.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476028355674132/WOLFS_10K_PACK_copy.jpg?width=459&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Дракон [ 200 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Драконы — летающие рептилии, покрытые чешуёй. У них две ноги и пара огромных перепончатых крыльев, как у летучих мышей.```',
        inline: true
      }
    ]
  },
  11: {
    price: 777,
    donate: false,
    author: {
      name: 'Пепельная текстура • 777 золота',
      icon_url: 'https://imgur.com/MGrk8c8.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476150107668480/01.png?width=520&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Пепельная текстура [ 777 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Необычно серо-пепельная текстура показывающая оттенки с тёмным цветом.```',
        inline: true
      }
    ]
  },
  12: {
    price: 2366,
    donate: false,
    author: {
      name: 'Золотая текстура  • 2366 золота',
      icon_url: 'https://imgur.com/NJBiv2b.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476164196335626/123_31.jpg?width=924&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Кровавая текстура         [ 2366 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Атмосферно кровавая сияющая текстура переливающая бурные оттенки.```',
        inline: true
      }
    ]
  },
  13: {
    price: 1111,
    donate: false,
    author: {
      name: 'Переливающаяся текстура • 1111 золота',
      icon_url: 'https://imgur.com/MGrk8c8.png'
    },
    image:
      'https://cdn.discordapp.com/attachments/758475953574772817/758476152288837673/123_20.jpg',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Переливающаяся текстура [ 1111 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Необычно переливающаяся текстура показывающая оттенки с тёмным цветом.```',
        inline: true
      }
    ]
  },
  14: {
    price: 1337,
    donate: false,
    author: {
      name: 'Зелёная текстура • 1337 золота',
      icon_url: 'https://imgur.com/NJBiv2b.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476157770399795/123_22.jpg?width=924&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Зелёная текстура [ 1337 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Необычно зелёная сияющая текстура переливающая тёмные оттенки.```',
        inline: true
      }
    ]
  },
  15: {
    price: 150,
    donate: true,
    author: {
      name: 'Золотая текстура  • 150 кристаллов',
      icon_url: 'https://imgur.com/NJBiv2b.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476159444582480/123_23.jpg?width=924&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Золотая текстура [ 150 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Атмосферно золотая сияющая текстура переливающая тёмные оттенки.```',
        inline: true
      }
    ]
  },

  16: {
    price: 1333,
    donate: false,
    author: {
      name: 'Кровавая текстура  • 1333 золота',
      icon_url: 'https://imgur.com/NJBiv2b.png'
    },
    image:
      'https://cdn.discordapp.com/attachments/758475953574772817/783858691974889502/16.png',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Кровавая текстура         [ 1333 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Атмосферно кровавая сияющая текстура переливающая бурные оттенки.```',
        inline: true
      }
    ]
  },
  17: {
    price: 2555,
    donate: false,
    author: {
      name: 'Радуга Дэш • 2555 золота',
      icon_url: 'https://imgur.com/sCKjeJ1.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476064120635442/KG9FPOb.png?width=924&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Радуга Дэш [ 2555 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Небесно-голубая пони-пегас с радужной гривой и хвостом. Она ответственна за поддержание погоды и расчистку неба от облаков на сервере.```',
        inline: true
      }
    ]
  },
  18: {
    price: 1555,
    donate: false,
    author: {
      name: 'Универсальный пакет • 1555 золота',
      icon_url: 'https://imgur.com/SZSNgWd.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476064699056168/123_113.jpg?width=346&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Универсальный пакет [ 1555 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Универсальная текстура пакета напоминающий туннель в нечто иное.```',
        inline: true
      }
    ]
  },
  19: {
    price: 1333,
    donate: false,
    author: {
      name: 'Горный мираж • 1333 золота',
      icon_url: 'https://imgur.com/lwdB5Nc.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476093496885268/Space_Amazing_Milky_Way_and_mountains_063826_.jpg?width=832&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Горный мираж [ 1333 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Необычная атмосферная картинка наполнена звездами и горными краями.```',
        inline: true
      }
    ]
  },
  20: {
    price: 300,
    donate: false,
    author: {
      name: 'Minecraft • 300 золота',
      icon_url: 'https://imgur.com/fLREgN7.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476026463518760/wp4031387.jpg?width=940&height=496',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Minercaft [ 300 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Майнкрафт не агрессивен. Он не провоцирует выброс «плохого» адреналина, не ввергает в состояние паники, не раздражает нервную систему вспышками или завыванием сирен.```',
        inline: true
      }
    ]
  },
  21: {
    price: 3000,
    donate: false,
    author: {
      name: 'Небо  • 3000 золота',
      icon_url: 'https://imgur.com/lwdB5Nc.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476113495982080/1588587374_25-p-foni-anime-67.jpg?width=924&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Небо [ 3000 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Умиротворяющее нарисованное небо голубыми тонами, характеризующая спокойную атмосферу.```',
        inline: true
      }
    ]
  },
  22: {
    price: 250,
    donate: true,
    author: {
      name: 'Магическое дерево  • 250 кристаллов',
      icon_url: 'https://imgur.com/deCpkUh.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476114837897257/5838097-forest-artist-artwork-digital-art-hd-painting-4k.jpg?width=924&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Магическое дерево       [ 250 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Мировое дерево — стержень всей скандинавской мифологии. Давным-давно когда не было ни миров ни богов вырос ясень Иггдрасиль или Лерад. Держит на себе это древо все миры и связывает их между собой.```',
        inline: true
      }
    ]
  },
  23: {
    price: 300,
    donate: false,
    author: {
      name: 'Dota 2 • 300 золота',
      icon_url: 'https://imgur.com/MawWeKU.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476113307107399/dota-2-dark-red-pc-games-professional-2400x1350-wallpaper.jpg?width=924&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Dota 2 [ 300 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Это настоящая хардкорная онлайн игра, здесь вы не сможете передохнуть ни минуты, за каждую вашу ошибку вы будете жестоко наказаны в чате вашими тимейтами и не только. С каждой проигранной партией вы будете терять частичку нервов, эта игра отнимет тысячи ваших часов, которые вы могли бы потратить на самосовершенствование. Так что не советую вам начинать играть, лучше пожалейте себя.```',
        inline: true
      }
    ]
  },
  24: {
    price: 300,
    donate: false,
    author: {
      name: 'Counter-Strike: Global Offensive • 300 золота',
      icon_url: 'https://imgur.com/O25zbV1.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476110248804372/CS-GO-logo-wallpapers-hd.jpg?width=924&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```CS:GO [ 300 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```куча потраченного времени, итог - изучите мат на польском, немного выучите английский, это все.```',
        inline: true
      }
    ]
  },
  25: {
    price: 300,
    donate: false,
    author: {
      name: 'League of Legends • 300 золота',
      icon_url: 'https://imgur.com/dhNPVun.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476060542500864/High_resolution_wallpaper_background_ID_77700810922.jpg?width=924&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```League of Legends  [ 300 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Это командная соревновательная игра 5 х 5, самая популярная в мире среди игр для ПК: в нее катает более 100 млн человек каждый месяц.```',
        inline: true
      }
    ]
  },
  26: {
    price: 300,
    donate: false,
    author: {
      name: 'Osu!  • 300 золота',
      icon_url: 'https://imgur.com/sn6S7L1.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476108227936296/97763681333879086d0d0806980bb67e.png?width=924&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Osu [ 300 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Одной из главных отличий osu! от других музыкальных игр являются игровые режимы, которых в игре всего четыре.```',
        inline: true
      }
    ]
  },
  27: {
    price: 777,
    donate: false,
    author: {
      name: 'Круглые узоры • 777 золота',
      icon_url: 'https://imgur.com/MGrk8c8.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476151567548466/1p2.jpg?width=520&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Круглые узоры [ 777 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value:
          '```Жёлтая текстура с круглыми узорами атмосферно смотрящаяся в профиле.```',
        inline: true
      }
    ]
  },
  28: {
    price: 777,
    donate: false,
    author: {
      name: 'Текстура зебры • 777 золота',
      icon_url: 'https://imgur.com/NsOrlzl.png'
    },
    image:
      'https://media.discordapp.net/attachments/758475953574772817/758476124652175390/ECS-ITPocket-PP_1.jpg?width=520&height=520',
    fields: [
      {
        name: '``` Название и цена ```',
        value: '```Текстура зебры [ 777 ]```',
        inline: true
      },
      {
        name: '``` Описание ```',
        value: '```Векторная иллюстрация зигзагообразной текстуры.```',
        inline: true
      }
    ]
  }
}
export default class extends Command {
  get options() {
    return { enabled: false }
  }
  
  async execute(message: Message) {
    const { author } = message
    const profile = await User.get(message.author.id)
    const pages: Page[] = Object.values(backgrounds).map(b => {
      return {
        embed: {
          title: '⠀⠀⠀⠀⠀⠀⠀⠀Меню изображении',
          author: b.author,
          image: { url: b.image },
          color: config.meta.defaultColor,
          footer: {
            text: author.tag,
            iconURL: author.displayAvatarURL({ dynamic: true })
          },
          timestamp: Date.now(),
          fields: b.fields
        }
      }
    })

    const book = new Book(pages, {
      actions: {
        [config.meta.emojis.deleteMessage]: {
          position: 'before',
          exec: message => {
            message.delete().catch(() => {})
          }
        },
        [config.meta.emojis.buy]: {
          position: 'after',
          exec: (message, page) => {
            const background = backgrounds[page]
            if (
              typeof profile.backgrounds === 'number' ||
              typeof profile.backgrounds === 'string'
            )
              profile.backgrounds = []
            if (profile.backgrounds.find(b => b === page)) return
            if (background.donate && profile.crystals < background.price) {
              message.channel
                .send({
                  embed: {
                    color: config.meta.defaultColor,
                    description: 'Недостаточно средств'
                  }
                })
                .then(msg =>
                  msg.delete({ timeout: config.meta.errorMsgDeletion })
                )
                .catch(() => {})
              return
            } else if (profile.gold < background.price) {
              message.channel
                .send({
                  embed: {
                    color: config.meta.defaultColor,
                    description: 'Недостаточно средств'
                  }
                })
                .then(msg =>
                  msg.delete({ timeout: config.meta.errorMsgDeletion })
                )
                .catch(() => {})
              return
            }

            const currency = background.donate ? 'crystals' : 'gold'
            profile.update({
              [currency]: profile[currency] - background.price,
              background: page,
              backgrounds: profile.backgrounds.concat([page])
            })
            message.delete().catch(() => {})
          }
        },
        [config.emojis.pencil]: {
          position: 'after',
          exec: (message, page) => {
            if (profile.backgrounds.includes(page)) {
              message.channel
                .send({
                  embed: {
                    color: config.meta.defaultColor,
                    description: 'Вы заменили картинку профиля'
                  }
                })
                .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
              profile.background = page
              profile.update({ background: page })
              message.delete().catch(() => {})
            }
            return
          }
        }
      },
      filter: (_reaction, user) => message.author.id === user.id,
      idle: config.meta.msgDeletion
    })
    book.send(message.channel as TextChannel, author).catch(() => {})
  }
}
