import { Intents, Permissions } from 'discord.js'
require('dotenv').config()

export const debug = false

export const internal = {
  token: '',
  prefix: '!',
  mongoURI: 'mongodb://127.0.0.1:27017/eth_main_test',
  prefixes: {
    clans: '/'
  }
}

export const intents =
  Intents.NON_PRIVILEGED |
  Intents.FLAGS.GUILD_MEMBERS |
  Intents.FLAGS.GUILD_PRESENCES

export const ids = {
  guilds: {
    main: '802516786716082187',
    administration: '533302669889110016'
  },
  messages: { verification: '771008365756416000', giveaway: '' },
  channels: {
    text: {
      mainChat: '783801524999421967',
      commands: ['783801524999421967'],
      valentineRequests: '',
      valentines: '',
      verification: '',
      giveaways: '824588350118952970'
    },
    voice: {
      createEvent: '783801525285290001',
      createClose: '783801525486223361',
      createPrivate: '821649578977394729'
    }
  },
  categories: {
    events: '783801525285289997',
    closes: '783801525285290002',
    loverooms: '802516789203435531',
    temprooms: '802516788914552845',
    privaterooms: '802516788452917285'
  },
  roles: {
    giveaway: '831701294958772235',

    button: '783801524840824840',

    hero: '783801524810809406',
    mute: '802516786775326723',
    event: '783801524764934149',
    // toxic: '768497919954255873',
    textmute: '783801524810809410', // tmute
    jumpmute: '802516786775326721', // jmute
    onenitro: '783801524810809407',
    // toxicInside: '801435626355556362',
    closemember: '802516786725650448',

    clans: '783801524810809405',
    temproles: '783801524790362126',

    immortalSponsor: '783801524840824837',
    legendarySponsor: '783801524824178737',
    diamondSponsor: '783801524824178736',

    owner: '783801524840824838',
    orion: '783801524840824836',
    sirius: '783801524840824835', // admin
    astral: '783801524840824833', // jr admin
    ghost: '783801524840824832', // moderator
    phoenix: '783801524824178734', // helper
    elderEvent: '783801524824178735',
    eventMod: '783801524824178733',
    closemaker: '730204504212897794',

    eventBan: '783801524824178729',

    warns: ['783801524824178731', '783801524824178730'],

    nightCity: '802516786733383683',

    gender: {
      null: '802516786725650443',
      unknown: '802516786725650444',
      male: '802516786725650445',
      female: '802516786725650446'
    },
    games: {
      Valorant: '802516786716082193',
      Minecraft: '802516786716082192',
      Overwatch: '802516786716082189',
      'Osu!': '802516786725650442',
      'Dota 2': '802516786716082195',
      'League of Legends': '802516786716082188',
      "PLAYERUNKNOWN'S BATTLEGROUNDS": '802516786716082194',
      'Counter-Strike: Global Offensive': '802516786716082196',
      'Among Us': '802516786716082190',
      Brawlhalla: '802516786716082191',
      'Genshin Impact': '824973820938027029'
    }
  },
  chests: {
    gold: 1 << 0,
    item: 1 << 1
  },
  goods: {
    ticket: 1 << 0,
    temprole1d: 1 << 1,
    temprole3d: 1 << 2,
    temprole7d: 1 << 3,
    hero7d: 1 << 4,
    temproom7d: 1 << 5,
    temproomSlot: 1 << 6,

    temprole30d: 1 << 7,
    temproom30d: 1 << 8,
    roomWithRole30d: 1 << 9,
    oneNitro30d: 1 << 10,
    loveroomRole: 1 << 11,
    hero: 1 << 12,
    clanWithRole: 1 << 13,
    donateTempRoomSlot: 1 << 14,
    clanGoldDoubler: 1 << 15,

    loveroom: 1 << 16
  },
  postTypes: {
    aesthetic: 0,
    erotic: 1,
    fun: 2,
    selfie: 3
  }
}

export const flags = {
  backgrounds: [1n << 0n, 1n << 1n, 1n << 2n, 1n << 3n]
}

export const emojis = {
  check: '✅',
  cross: '❌',
  pencil: '📝',
  question: '❔',
  arrowLeft: '⬅️',
  arrowRight: '➡️',
  wastebasket: '🗑️',
  arrowBackward: '◀️',
  arrowForward: '▶️',

  arrowBackwardMenu: '◀️',
  arrowForwardMenu: '▶️',
  rulesMenu: '📝',
  welcomeMenu: '❔',
  commandsMenu: '😎',
  giveaway: '',

  numbers: [
    '749659635241320448',
    '749660008882372679',
    '749660111693152376',
    '749660320410239083'
  ],

  empty: '783804668127084544',
  roles: '783805701554044929',
  verification: {
    id: '698596668769173645',
    display: '<a:ver:783805946237288448>'
  },
  fail: {
    id: '698590387002146816',
    display: '<a:fai:783806133298266122>'
  },
  gold: '828354682736214016',
  crystal: '828354681670729799',
  medal: {
    id: '753016395612291084',
    display: '<:medal:753016395612291084>'
  },
  places: {
    first: {
      id: '691712892998778920',
      display: '<:first:691712892998778920>'
    },
    second: {
      id: '691712893179134013',
      display: '<:second:691712893179134013>'
    },
    third: {
      id: '691712893124608052',
      display: '<:third:691712893124608052>'
    }
  }
}

export const colors = {
  embed: 0x2f3136
}

export const timezones = {
  moscow: 'Europe/Moscow'
}

export const repRanks = {
  '0': 'Неизвестный',

  '-1': 'Недоверие',
  '-10': 'Настороженность',
  '-20': 'Неуверенность',
  '-30': 'Неприязнь',
  '-40': 'Враждебность',
  '-50': 'Ненависть',

  '5': 'Симпатия',
  '15': 'Доверие',
  '30': 'Превознесение',
  '50': 'Почтение',
  '65': 'Уважение',
  '80': 'Дружелюбие',
  '90': 'Сверхразум',
  '130': 'Благородный|Благородная',
  '160': 'Хранитель мудрости',
  '200': 'Превозносимый'
}

export const lvlRanks: { [key: number]: string } = {
  1: 'Отшельник',
  2: 'Странник',
  3: 'Новобранец',
  4: 'Балроги',
  5: 'Майар',
  6: 'Айнур',
  7: 'Мертвые',
  8: 'Охотник',
  9: 'Назгулы',
  10: 'Орки',
  11: 'Гоблины',
  12: 'Энты',
  13: 'Хуорны',
  14: 'Вивисектор',
  15: 'Легендапустошей',
  16: 'Аннигилятормутантов',
  17: 'Эйдан',
  18: 'Эльфы',
  19: 'Потрошитель',
  20: 'Следопыт',
  21: 'Истребитель',
  22: 'Воргены',
  23: 'Одержимый',
  24: 'Миротворец',
  25: 'Вульперы',
  26: 'Зверобой',
  27: 'Ночнорожденные',
  28: 'Совершенные',
  29: 'Бессмертные'
}
export const swapCoefs = {
  '1': 24,
  '300': 27,
  '500': 28,
  '700': 30,
  '1000': 32
}

export const access = {
  commands: {
    award: [ids.roles.owner, ids.roles.orion, ids.roles.sirius],
    take: [ids.roles.owner, ids.roles.orion, ids.roles.sirius],
    say: [
      ids.roles.owner,
      ids.roles.orion,
      ids.roles.sirius,
      ids.roles.astral,
      ids.roles.ghost,
      ids.roles.phoenix,
      ids.roles.eventMod,
      ids.roles.elderEvent,
      ids.roles.closemaker
    ]
  }
}

export const postTypes = {
  эстетика: ids.postTypes.aesthetic,
  эротика: ids.postTypes.erotic,
  мемник: ids.postTypes.fun,
  селфи: ids.postTypes.selfie
}

export const postChannels = {
  [ids.postTypes.aesthetic]: '759674932493156383',
  [ids.postTypes.erotic]: '759676367482257459',
  [ids.postTypes.fun]: '774362625865678848',
  [ids.postTypes.selfie]: '811145910683041792'
}
export const postSend = {
  [ids.postTypes.aesthetic]: '737037101081690264',
  [ids.postTypes.erotic]: '737040143172632628',
  [ids.postTypes.fun]: '774359236096294922',
  [ids.postTypes.selfie]: '811288456609136640'
}
export const postEmojis = {
  [ids.postTypes.aesthetic]: '802498886123651102',
  [ids.postTypes.erotic]: '802351659456004096',
  [ids.postTypes.fun]: '802335134635786261',
  [ids.postTypes.selfie]: '802508872026947594'
}

export const meta = {
  privateRoomName: "{nickname}'s room",
  closeRoomName: "{nickname}'s close",
  eventRoomName: "{nickname}'s event",
  allowedGuilds: [ids.guilds.main, ids.guilds.administration],
  joinRoleID: ids.roles.gender.null,
  defaultColor: colors.embed,
  typeofReputation: ['+', '-'],
  brLoseColor: 0xe97171,
  brWinColor: 0xa0c1b8,
  bfLoseColor: 0xe97171,
  bfWinColor: 0xa0c1b8,
  defaultTimezone: timezones.moscow,
  welcomeChannelID: ids.channels.text.mainChat,
  errorMsgDeletion: 1.5e4, // 15 secs
  msgDeletion: 3e4, // 30 secs
  timelyAmount: 50,
  timelyInterval: 4.32e7, // 12 hours
  minimumAccountTime: 4.32e7, // 12 hours
  repIntHourly: 1.08e7, // 3 часа
  maxAwardGold: 25000,
  maxAwardCrystals: 10000,
  pairCost: 5000,
  clanCost: 1000,
  bumpAward: 150,
  clanNameLimit: 32,
  clanDescLimit: 200,
  reputationInterval: 6.048e8, // 7 days
  leaveClearInterval: 6.048e8, // 7 days
  minbfBet: 5,
  maxbfBet: 100,
  minbrBet: 5,
  maxbrBet: 200,
  statusLimit: 200,
  minReactionPrice: 20,
  maxReactionPrice: 30,
  temproomSlots: 3,
  temproomNamePrice: 350,
  temproomNameConfirmLimit: 3e5, // 5 mins
  temproomDeleteConfirmLimit: 3e5, // 5 mins
  temproleNamePrice: 350,
  temproleColorPrice: 300,
  temproleNameConfirmLimit: 3e5, // 5 mins
  temproleColorConfirmLimit: 3e5, // 5 mins
  temproleDeleteConfirmLimit: 3e5, // 5 mins
  temproleNoColorConfirmLimit: 3e5, // 5 mins
  checkInterval: 3.6e6, // 1 hour
  privateNameInterval: 6e5, // 10 mins
  privateLimitInterval: 1.2e5, // 2 mins
  privateOwnerTransferInterval: 1.2e5, // 2 mins
  pairroomName: '{nickname.1} 🖤 {nickname.2}',
  confirmEmojis: [emojis.verification.id, emojis.fail.id],
  brMinRandomres: 0,
  brMaxRandomres: 120,
  goldMultipliers: {
    [ids.roles.immortalSponsor]: 4,
    [ids.roles.legendarySponsor]: 3,
    [ids.roles.diamondSponsor]: 2,
    [ids.roles.onenitro]: 2
  },
  goldChestChances: {
    150: 35,
    300: 30,
    650: 20,
    850: 10,
    1050: 5
  },
  goldChestImages: {
    150: 'https://i.imgur.com/OLDyzIp.gif',
    300: 'https://i.imgur.com/f9xbNTp.gif',
    650: 'https://i.imgur.com/qdLp9Sg.gif',
    850: 'https://i.imgur.com/gH7wXxe.gif',
    1050: 'https://i.imgur.com/szQrM4d.gif'
  },
  itemChestChances: {
    [ids.goods.ticket]: 30,
    [ids.goods.temprole1d]: 20,
    [ids.goods.temprole3d]: 25,
    [ids.goods.temprole7d]: 5,
    [ids.goods.temproom7d]: 10,
    [ids.goods.hero7d]: 10
  },
  itemChestImages: {
    [ids.goods.ticket]: 'https://i.imgur.com/nUNo0RD.gif',
    [ids.goods.temprole1d]: 'https://i.imgur.com/Z6AbljU.gif',
    [ids.goods.temprole3d]: 'https://i.imgur.com/MnvVhaN.gif',
    [ids.goods.temprole7d]: 'https://i.imgur.com/bLvnKVn.gif',
    [ids.goods.temproom7d]: 'https://i.imgur.com/qaxhF2j.gif',
    [ids.goods.hero7d]: 'https://i.imgur.com/smHgCoh.gif'
  },
  brCoef: {
    0: 0,
    44: 1.25,
    70: 2,
    120: 10
  },
  emojis: {
    cy: emojis.gold, // Currency
    buy: emojis.check,
    donateCy: emojis.crystal, // Donate currency
    deleteMessage: emojis.wastebasket,
    status: [emojis.fail.display, emojis.verification.display],
    pageControl: [emojis.arrowBackward, emojis.arrowForward],
    previewMsg: {
      return: emojis.cross,
      getCode: emojis.question,
      newCode: emojis.pencil,
      editMessage: emojis.check
    }
  },
  chestDrops: {
    [ids.goods.ticket]: { id: ids.goods.ticket, chance: 30 },
    [ids.goods.temprole1d]: { id: ids.goods.temprole1d, chance: 25 },
    [ids.goods.temprole3d]: { id: ids.goods.temprole3d, chance: 20 },
    [ids.goods.temprole7d]: { id: ids.goods.temprole7d, chance: 15 },
    [ids.goods.hero7d]: { id: ids.goods.hero7d, chance: 5 },
    [ids.goods.temproom7d]: { id: ids.goods.temproom7d, chance: 5 }
  },
  timeSpelling: {
    w: 'н',
    d: 'д',
    h: 'ч',
    m: 'м',
    s: 'с'
  },
  permissions: {
    privateroom: {
      default: [
        {
          id: ids.roles.gender.null,
          allow: 0,
          deny: Permissions.FLAGS.CONNECT | Permissions.FLAGS.VIEW_CHANNEL
        },
        {
          id: ids.roles.jumpmute,
          allow: 0,
          deny: Permissions.FLAGS.CONNECT
        },
        {
          id: ids.roles.mute,
          allow: 0,
          deny: Permissions.FLAGS.SPEAK
        }
      ],
      creator: {
        allow:
          Permissions.FLAGS.CREATE_INSTANT_INVITE |
          Permissions.FLAGS.VIEW_CHANNEL |
          Permissions.FLAGS.CONNECT |
          Permissions.FLAGS.SPEAK |
          Permissions.FLAGS.STREAM |
          Permissions.FLAGS.USE_VAD |
          Permissions.FLAGS.PRIORITY_SPEAKER,
        deny:
          Permissions.FLAGS.MANAGE_CHANNELS |
          Permissions.FLAGS.MANAGE_ROLES |
          Permissions.FLAGS.MANAGE_WEBHOOKS |
          Permissions.FLAGS.MOVE_MEMBERS
      },
      orion: {
        allow:
          Permissions.FLAGS.CREATE_INSTANT_INVITE |
          Permissions.FLAGS.MANAGE_CHANNELS |
          Permissions.FLAGS.VIEW_CHANNEL |
          Permissions.FLAGS.CONNECT |
          Permissions.FLAGS.SPEAK |
          Permissions.FLAGS.STREAM |
          Permissions.FLAGS.USE_VAD |
          Permissions.FLAGS.PRIORITY_SPEAKER |
          Permissions.FLAGS.MANAGE_ROLES |
          Permissions.FLAGS.MANAGE_WEBHOOKS |
          Permissions.FLAGS.MOVE_MEMBERS,
        deny: 0
      },
      everyone: {
        allow: Permissions.FLAGS.STREAM,
        deny: 0
      }
    },
    event: {
      default: [
        {
          id: ids.roles.gender.null,
          allow: 0,
          deny: Permissions.FLAGS.CONNECT | Permissions.FLAGS.VIEW_CHANNEL
        },
        {
          id: ids.roles.jumpmute,
          allow: 0,
          deny: Permissions.FLAGS.CONNECT
        },
        {
          id: ids.roles.mute,
          allow: 0,
          deny: Permissions.FLAGS.CONNECT
        },
        // {
        //   id: ids.roles.toxic,
        //   allow: 0,
        //   deny:
        //     Permissions.FLAGS.CONNECT |
        //     Permissions.FLAGS.SEND_MESSAGES |
        //     Permissions.FLAGS.ADD_REACTIONS
        // },
        {
          id: ids.roles.eventBan,
          allow: 0,
          deny:
            Permissions.FLAGS.CONNECT |
            Permissions.FLAGS.SEND_MESSAGES |
            Permissions.FLAGS.ADD_REACTIONS
        },
        {
          id: ids.roles.textmute,
          allow: 0,
          deny:
            Permissions.FLAGS.SEND_MESSAGES | Permissions.FLAGS.ADD_REACTIONS
        }
      ],
      creator: {
        allow:
          Permissions.FLAGS.CREATE_INSTANT_INVITE |
          Permissions.FLAGS.MANAGE_CHANNELS |
          Permissions.FLAGS.MANAGE_ROLES |
          Permissions.FLAGS.VIEW_CHANNEL |
          Permissions.FLAGS.CONNECT |
          Permissions.FLAGS.SPEAK |
          Permissions.FLAGS.STREAM |
          Permissions.FLAGS.MUTE_MEMBERS |
          Permissions.FLAGS.DEAFEN_MEMBERS |
          Permissions.FLAGS.USE_VAD |
          Permissions.FLAGS.PRIORITY_SPEAKER,
        deny:
          Permissions.FLAGS.MANAGE_ROLES |
          Permissions.FLAGS.MANAGE_WEBHOOKS |
          Permissions.FLAGS.MOVE_MEMBERS
      },
      everyone: {
        allow: Permissions.FLAGS.STREAM,
        deny: 0
      }
    },
    loveroom: {
      default: [],
      member: {
        allow: Permissions.FLAGS.VIEW_CHANNEL | Permissions.FLAGS.CONNECT,
        deny: 0
      },
      everyone: {
        allow: 0,
        deny: Permissions.FLAGS.VIEW_CHANNEL | Permissions.FLAGS.CONNECT
      }
    },
    temproom: {
      default: [
        {
          id: ids.roles.gender.null,
          allow: 0,
          deny: Permissions.FLAGS.CONNECT | Permissions.FLAGS.VIEW_CHANNEL
        },
        {
          id: ids.roles.jumpmute,
          allow: 0,
          deny: Permissions.FLAGS.CONNECT
        },
        {
          id: ids.roles.mute,
          allow: 0,
          deny: Permissions.FLAGS.SPEAK
        }
      ],
      member: {
        allow:
          Permissions.FLAGS.VIEW_CHANNEL |
          Permissions.FLAGS.CONNECT |
          Permissions.FLAGS.SPEAK |
          Permissions.FLAGS.STREAM |
          Permissions.FLAGS.MUTE_MEMBERS |
          Permissions.FLAGS.DEAFEN_MEMBERS |
          Permissions.FLAGS.USE_VAD |
          Permissions.FLAGS.PRIORITY_SPEAKER,
        deny: 0
      },
      everyone: {
        allow: 0,
        deny: Permissions.FLAGS.CONNECT
      }
    }
  }
}
