import { Intents, Permissions } from 'discord.js'
require('dotenv').config()

export const debug = false

export const internal = {
  token: '',
  prefix: '!',
  mongoURI: 'mongodb://127.0.0.1:27017/ethereal_main',
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
    main: '728716141802815539',
    administration: '539086938964099074'
  },
  messages: {
    verification: '771008365756416000',
    giveaway: '831703225576456233'
  },
  channels: {
    text: {
      mainChat: '761614282130587698',
      commands: [
        '761614282130587698',
        '737034592506085486',
        '749357120838828083',
        '74783466054483983'
      ],
      valentineRequests: '807886483247464449',
      valentines: '808210990168539176',
      verification: '737037176184766484',
      giveaways: '831678325986033674'
    },
    voice: {
      createEvent: '748230978941616128',
      createClose: '761617242030866453',
      createPrivate: '737043501581074540'
    }
  },
  categories: {
    events: '747828228613210142',
    closes: '749356426094182410',
    loverooms: '737307684792959017',
    temprooms: '737306176525697054',
    privaterooms: '728725005285851216'
  },
  roles: {
    giveaway: '831701294958772235',

    button: '728723863348707338',

    hero: '747168601940688976',
    mute: '730203474662260819',
    event: '730204747898028202',
    // toxic: '768497919954255873',
    textmute: '730203474263801903', // tmute
    jumpmute: '730203473521541170', // jmute
    onenitro: '730204566594912397',
    // toxicInside: '768497919954255873',
    closemember: '791375170651815976',

    clans: '730204746845257728',
    temproles: '730204746949853196',

    immortalSponsor: '744794061600456784',
    legendarySponsor: '741599274579525662',
    diamondSponsor: '744794551260282911',

    owner: '739918620796125245',
    orion: '740312785967251467',
    sirius: '739906975898402938', // admin
    astral: '740312130456256552', // jr admin
    ghost: '740360450704670920', // moderator
    phoenix: '740361025513193473', // helper
    elderEvent: '744564449729445888',
    eventMod: '744563995771404408',
    closemaker: '730204504212897794',

    eventBan: '730203472703783023',

    warns: ['730203471155822682', '730203471747481620'],

    nightCity: '740370283461869618',

    gender: {
      null: '730204767590285364',
      unknown: '730204767426707467',
      male: '730204766155571291',
      female: '730204766671601724'
    },
    games: {
      Valorant: '730206983227179169',
      Minecraft: '730206983889748068',
      Overwatch: '730206984309047356',
      'Osu!': '730204768500187246',
      'Dota 2': '730206982350438522',
      'League of Legends': '730204769410613279',
      "PLAYERUNKNOWN'S BATTLEGROUNDS": '730204768848576553',
      'Counter-Strike: Global Offensive': '730204769410613279',
      'Among Us': '759345255165329478',
      Brawlhalla: '759345255165329478',
      'Genshin Impact': '831678368792576040'
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
    selfie: 3,
    creation: 4
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
  giveaway: '827482597348605952',

  arrowBackwardMenu: '775084939682381854',
  arrowForwardMenu: '775084939052974091',
  rulesMenu: '774629841239801906',
  welcomeMenu: '774630747985412106',
  commandsMenu: '774629841210310667',

  numbers: [
    '749659635241320448',
    '749660008882372679',
    '749660111693152376',
    '749660320410239083'
  ],

  empty: '691712892923543593',
  roles: '697223345049042964',
  verification: {
    id: '698596668769173645',
    display: '<a:verification:698596668769173645>'
  },
  fail: {
    id: '698590387002146816',
    display: '<a:fail:698590387002146816>'
  },
  gold: '802323778134081556',
  crystal: '802324736859701248',
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
  селфи: ids.postTypes.selfie,
  творчество: ids.postTypes.creation
}

export const postChannels = {
  [ids.postTypes.aesthetic]: '759674932493156383',
  [ids.postTypes.erotic]: '759676367482257459',
  [ids.postTypes.fun]: '774362625865678848',
  [ids.postTypes.selfie]: '811145910683041792',
  [ids.postTypes.creation]: '814894467949002762'
}
export const postSend = {
  [ids.postTypes.aesthetic]: '737037101081690264',
  [ids.postTypes.erotic]: '737040143172632628',
  [ids.postTypes.fun]: '774359236096294922',
  [ids.postTypes.selfie]: '811288456609136640',
  [ids.postTypes.creation]: '805933150487314463'
}
export const postEmojis = {
  [ids.postTypes.aesthetic]: '802498886123651102',
  [ids.postTypes.erotic]: '802351659456004096',
  [ids.postTypes.fun]: '802335134635786261',
  [ids.postTypes.selfie]: '802487512609849354',
  [ids.postTypes.creation]: '802352461380976650'
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
  faketime: 2.592e8, // 72 h
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
        deny: Permissions.FLAGS.MENTION_EVERYONE
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
