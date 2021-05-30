export interface ReactionInfo {
  name: string
  flag: number
  aliases: string[]
  description?: string
  images: string[]
  confirmReplies?: string[]
  singleReplies?: string[]
  doubleReplies?: string[]
}

const reactions: ReactionInfo[] = [
  {
    name: 'злюсь',
    flag: 0b0,
    aliases: [],
    description: '',
    images: [
      'https://i.imgur.com/HbRSFXI.gif',
      'https://i.imgur.com/lcdCm9P.gif',
      'https://i.imgur.com/uwf8FNj.gif',
      'https://i.imgur.com/Sy8mepf.gif',
      'https://i.imgur.com/QWh5rua.gif',
      'https://i.imgur.com/i9v3epv.gif',
      'https://i.imgur.com/PILHuxB.gif',
      'https://i.imgur.com/V2DlPaw.gif',
      'https://i.imgur.com/fAEltrA.gif',
      'https://i.imgur.com/niBCXzL.gif',
      'https://i.imgur.com/uscnuA2.gif',
      'https://i.imgur.com/otRruhO.gif',
      'https://i.imgur.com/ZSFOdv4.gif',
      'https://i.imgur.com/Tbts0rK.gif',
      'https://i.imgur.com/Gi9SXAr.gif',
      'https://i.imgur.com/SQuPGf1.gif',
      'https://i.imgur.com/PnV5O55.gif',
      'https://i.imgur.com/8zsjPqq.gif',
      'https://i.imgur.com/NiwAb9W.gif',
      'https://i.imgur.com/4ZbJmLx.gif'
    ],
    singleReplies: ['{author} злится. Все прячьтесь! ＼(〇_ｏ)／']
  },
  {
    name: 'смущаюсь',
    flag: 0b0,
    aliases: [],
    images: [
      'https://i.imgur.com/CJkFT4k.gif',
      'https://i.imgur.com/EOtyiOh.gif',
      'https://i.imgur.com/PcgrSRb.gif',
      'https://i.imgur.com/reAxr14.gif',
      'https://i.imgur.com/hQQbOF4.gif',
      'https://i.gifer.com/3O5KM.gif',
      'https://i.gifer.com/3O5KK.gif',
      'https://i.gifer.com/3O5KL.gif'
    ],
    singleReplies: ['{author} засмущали, какая милашка (´♡‿♡`)']
  },
  {
    name: 'радуюсь',
    flag: 0b0,
    aliases: [],
    images: [
      'https://i.gifer.com/3O5K3.gif',
      'https://i.gifer.com/3O5K6.gif',
      'https://i.gifer.com/3O5K7.gif',
      'https://i.gifer.com/3O5K5.gif',
      'https://i.gifer.com/3O5K4.gif'
    ],
    singleReplies: [
      'Самое время для радости и {author} не упускает этой возможности! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧'
    ]
  },
  {
    name: 'сплю',
    flag: 0b0,
    aliases: [],
    images: [
      'https://i.gifer.com/3O5KN.gif',
      'https://i.gifer.com/3O5KP.gif',
      'https://i.gifer.com/3O5KO.gif'
    ],
    singleReplies: ['{author} ложится спать, всем тссс. (-_-;)・・・']
  },
  {
    name: 'курю',
    flag: 0b0,
    aliases: [],
    images: [
      'https://i.gifer.com/3O5J4.gif',
      'https://i.gifer.com/3O5J8.gif',
      'https://i.gifer.com/3O5J5.gif',
      'https://i.gifer.com/3O5J6.gif',
      'https://i.gifer.com/3O5J7.gif'
    ],
    singleReplies: ['{author} решил(а) закурить, открываем форточку!']
  },
  {
    name: 'плачу',
    flag: 0b0,
    aliases: [],
    images: [
      'https://i.gifer.com/3O5Jc.gif',
      'https://i.gifer.com/3O5Je.gif',
      'https://i.gifer.com/3O5Jf.gif',
      'https://i.gifer.com/3O5Jd.gif',
      'https://i.gifer.com/3O5Ja.gif'
    ],
    singleReplies: ['Ну вот, {author} довели до слёз! (μ_μ)']
  },
  {
    name: 'смеюсь',
    flag: 0b0,
    aliases: [],
    images: [
      'https://i.gifer.com/3O5KE.gif',
      'https://i.gifer.com/3O5KF.gif',
      'https://i.gifer.com/3O5KH.gif',
      'https://i.gifer.com/3O5KG.gif',
      'https://i.gifer.com/3O5KJ.gif',
      'https://i.gifer.com/3O5KI.gif'
    ],
    singleReplies: ['{author} рассмеялся(-лась)']
  },
  {
    name: 'пью чай',
    flag: 0b0,
    aliases: [],
    images: [
      'https://i.gifer.com/3O5K0.gif',
      'https://i.gifer.com/3O5K1.gif',
      'https://i.gifer.com/3O5K2.gif',
      'https://i.gifer.com/3O5Jz.gif'
    ],
    singleReplies: [
      'Началось чаепитие! кто присоединиться к {author}? (ノ*°▽°*)'
    ]
  },
  {
    name: 'танец',
    flag: 0b0,
    aliases: [],
    images: [
      'https://i.gifer.com/3O5KR.gif',
      'https://i.gifer.com/3O5KU.gif',
      'https://i.gifer.com/3O5KT.gif',
      'https://i.gifer.com/3O5KQ.gif',
      'https://i.gifer.com/3O5KS.gif',
      'https://i.gifer.com/3O5KV.gif'
    ],
    singleReplies: ['{author} начинает дискотеку века, танцуем! ʕ •̀ ω •́ ʔ']
  },
  {
    name: 'грусть',
    flag: 0b0,
    aliases: [],
    images: [
      'https://i.gifer.com/3O5Iw.gif',
      'https://i.gifer.com/3O5Iv.gif',
      'https://i.gifer.com/3O5Ix.gif',
      'https://i.gifer.com/3O5It.gif',
      'https://i.gifer.com/3O5Iu.gif'
    ],
    singleReplies: ['{author} загрустил(а), поддержите человека... (｡•́︿•̀｡)']
  },
  {
    name: 'шок',
    flag: 0b0,
    aliases: [],
    images: [
      'https://i.gifer.com/3O5Kl.gif',
      'https://i.gifer.com/3O5Kk.gif',
      'https://i.gifer.com/3O5Kj.gif',
      'https://i.gifer.com/3O5Ki.gif'
    ],
    singleReplies: ['А {author} просто в шоке!']
  },
  {
    name: 'еда',
    flag: 0b0,
    aliases: [],
    images: [
      'https://i.gifer.com/3O5J0.gif',
      'https://i.gifer.com/3O5Iz.gif',
      'https://i.gifer.com/3O5J2.gif',
      'https://i.gifer.com/3O5J1.gif',
      'https://i.gifer.com/3O5Iy.gif',
      'https://i.gifer.com/3O5J3.gif'
    ],
    singleReplies: [
      '{author} захотелось перекусить, желаем приятного аппетита! (⁄ ⁄•⁄ω⁄•⁄ ⁄)'
    ]
  },
  {
    name: 'бежать',
    flag: 0b0,
    aliases: [],
    images: [
      'https://i.gifer.com/3O5Ik.gif',
      'https://i.gifer.com/3O5In.gif',
      'https://i.gifer.com/3O5Im.gif',
      'https://i.gifer.com/3O5Ij.gif',
      'https://i.gifer.com/3O5Il.gif',
      'https://i.gifer.com/3O5Ii.gif'
    ],
    singleReplies: [
      'Небо уронит ночь на ладоне! {author} не догонят, {author} не догоняяят!'
    ]
  },
  {
    name: 'болеет',
    flag: 0b0,
    aliases: [],
    images: [
      'https://imgur.com/ovdNwYp.gif',
      'https://imgur.com/RKPQviR.gif',
      'https://imgur.com/CdwDzd0.gif'
    ],
    singleReplies: ['{author}, приболел(а), несите чаю!']
  },
  {
    name: 'погладить',
    flag: 0b01,
    aliases: [],
    description: 'приголубить',
    images: [
      'https://i.imgur.com/KRmGyir.gif',
      'https://i.imgur.com/etHhs73.gif',
      'https://i.imgur.com/T23Qv2V.gif',
      'https://i.gifer.com/3O5Jh.gif',
      'https://i.gifer.com/3O5Ji.gif',
      'https://i.gifer.com/3O5Jg.gif',
      'https://i.gifer.com/3O5Jj.gif',
      'https://i.gifer.com/3O5Jk.gif'
    ],
    doubleReplies: [
      '{author} гладит {target} по головке! Наверное это приятно... (⌒ω⌒)'
    ]
  },
  {
    name: 'кусь',
    flag: 0b01,
    aliases: [],
    description: 'укусить',
    images: [
      'https://i.imgur.com/jSqYhns.gif',
      'https://i.imgur.com/lrthhlp.gif',
      'https://i.imgur.com/k5jgu1Y.gif',
      'https://i.imgur.com/Bn0SfIb.gif',
      'https://i.imgur.com/Bdf5EKT.gif',
      'https://i.imgur.com/LmquT01.gif',
      'https://i.imgur.com/gD9COkC.gif',
      'https://i.gifer.com/3O5J9.gif',
      'https://i.gifer.com/3O5JA.gif',
      'https://i.gifer.com/3O5JC.gif',
      'https://i.gifer.com/3O5JD.gif',
      'https://i.gifer.com/3O5JB.gif'
    ],
    doubleReplies: [
      '{author} нежно кусает {target}, между ними пробежала искра?'
    ]
  },
  {
    name: 'ласкать',
    flag: 0b01,
    aliases: [],
    description: 'приласкать',
    images: [
      'https://i.gifer.com/3O5JE.gif',
      'https://i.gifer.com/3O5JF.gif',
      'https://i.gifer.com/3O5JH.gif',
      'https://i.gifer.com/3O5JI.gif',
      'https://i.gifer.com/3O5JG.gif',
      'https://imgur.com/a/NLwa8bI.gif',
      'https://i.imgur.com/bwLyRUB.gif'
    ],
    doubleReplies: [
      'Уляля! {author} ласкает {target}, давайте оставим их наедине. (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)'
    ]
  },
  {
    name: 'любовь',
    flag: 0b01,
    aliases: [],
    description: 'пристрастие',
    images: [
      'https://i.imgur.com/UrvHl1H.gif',
      'https://i.imgur.com/RU8fsS3.gif',
      'https://i.imgur.com/tUear5r.gif',
      'https://i.gifer.com/3O5JQ.gif',
      'https://i.gifer.com/3O5JP.gif',
      'https://i.gifer.com/3O5JS.gif',
      'https://i.gifer.com/3O5JR.gif',
      'https://i.gifer.com/3O5JU.gif',
      'https://i.gifer.com/3O5JT.gif'
    ],
    confirmReplies: ['{author} признается в любви'],
    doubleReplies: [
      '{author} выражает любовь к {target}, давайте пожелаем им счастья! (ɔˆз(ˆ⌣ˆc)'
    ]
  },
  {
    name: 'обнять',
    flag: 0b01,
    aliases: [],
    description: 'облапить',
    images: [
      'https://i.imgur.com/HZ423Nr.gif',
      'https://i.imgur.com/RWTBzWm.gif',
      'https://i.imgur.com/LSFissS.gif',
      'https://i.imgur.com/edYHVXC.gif',
      'https://i.imgur.com/vAKa8OK.gif',
      'https://i.imgur.com/O6qhsfp.gif',
      'https://i.imgur.com/7jf6ihH.gif',
      'https://i.imgur.com/aHudUj9.gif',
      'https://i.imgur.com/xJlv3OX.gif',
      'https://i.gifer.com/3O5JV.gif',
      'https://i.gifer.com/3O5JX.gif',
      'https://i.gifer.com/3O5JW.gif',
      'https://i.gifer.com/3O5JZ.gif',
      'https://i.gifer.com/3O5JY.gif'
    ],
    confirmReplies: ['{author} хочет тебя обнять'],
    doubleReplies: ['{author} и {target} обнимаются, ну разве это не мило?']
  },
  {
    name: 'поцеловать',
    flag: 0b01,
    aliases: [],
    description: 'коснуться',
    images: [
      'https://i.imgur.com/Ui0Gy9z.gif',
      'https://i.imgur.com/Tj0rUWc.gif',
      'https://i.imgur.com/pKwOitS.gif',
      'https://i.imgur.com/x2gEP9W.gif',
      'https://i.imgur.com/fSCM7Wu.gif',
      'https://i.gifer.com/3O5Jp.gif',
      'https://i.gifer.com/3O5Jq.gif',
      'https://i.gifer.com/3O5Jo.gif',
      'https://i.gifer.com/3O5Jr.gif',
      'https://i.gifer.com/3O5Jn.gif',
      'https://i.gifer.com/3O5Js.gif',
      'https://i.imgur.com/lY2Tjgb.gif',
      'https://i.imgur.com/Iue9U1s.gif'
    ],
    confirmReplies: ['{author} хочет тебя поцеловать'],
    doubleReplies: [
      '{author} решил(а) поцеловать {target}, может они встречаются? (°◡°♡)'
    ]
  },
  {
    name: 'тык',
    flag: 0b01,
    aliases: [],
    images: [
      'https://i.imgur.com/yag3ZYn.gif',
      'https://i.imgur.com/ymqGwDg.gif',
      'https://i.imgur.com/JuUar1G.gif',
      'https://i.gifer.com/3O5KZ.gif',
      'https://i.gifer.com/3O5KW.gif',
      'https://i.gifer.com/3O5Kb.gif',
      'https://i.gifer.com/3O5KX.gif',
      'https://i.gifer.com/3O5Ka.gif',
      'https://i.gifer.com/3O5KY.gif'
    ],
    doubleReplies: ['{target} получает тык от {author}']
  },
  {
    name: 'лизнуть',
    flag: 0b01,
    aliases: [],
    description: 'облизать',
    images: [
      'https://i.imgur.com/SoNfzBt.gif',
      'https://i.imgur.com/Vilc4qr.gif',
      'https://i.imgur.com/psNxCtP.gif',
      'https://i.gifer.com/3O5JO.gif',
      'https://i.gifer.com/3O5JL.gif',
      'https://i.gifer.com/3O5JK.gif',
      'https://i.gifer.com/3O5JN.gif',
      'https://i.gifer.com/3O5JM.gif'
    ],
    doubleReplies: ['{author} лизнул(а) {target}, видимо он(а) вкусный(ая)!']
  },
  {
    name: 'секс',
    flag: 0b01,
    aliases: [],
    description: 'половая активность',
    images: [
      'https://i.gifer.com/3O5KA.gif',
      'https://i.gifer.com/3O5KB.gif',
      'https://i.gifer.com/3O5K9.gif',
      'https://i.gifer.com/3O5K8.gif',
      'https://i.gifer.com/3O5KD.gif'
    ],
    confirmReplies: ['{author} хочет с тобой пошалить'],
    doubleReplies: ['{author} пристаёт к {target}, какие пошлости, божечки!']
  },
  {
    name: 'пощечина',
    flag: 0b010,
    aliases: [],
    description: 'удар',
    images: [
      'https://i.imgur.com/yWrUflv.gif',
      'https://i.imgur.com/3NUKgII.gif',
      'https://i.imgur.com/539oUEr.gif',
      'https://i.imgur.com/CLTysXv.gif',
      'https://i.gifer.com/3O5Jw.gif',
      'https://i.gifer.com/3O5Jy.gif',
      'https://i.gifer.com/3O5Jx.gif',
      'https://i.gifer.com/3O5Jv.gif',
      'https://i.gifer.com/3O5Jt.gif',
      'https://i.gifer.com/3O5Ju.gif'
    ],
    doubleReplies: ['Ой-ой-ой, {author} влепил(а) пощёчину {target} ((╬◣﹏◢))']
  },
  {
    name: 'выстрелить',
    flag: 0b010,
    aliases: [],
    description: 'нажать курок',
    images: [
      'https://i.imgur.com/nvmZcGn.gif',
      'https://i.imgur.com/A1vkivG.gif',
      'https://i.imgur.com/eBWsqbE.gif',
      'https://i.gifer.com/3O5Io.gif',
      'https://i.gifer.com/3O5Is.gif',
      'https://i.gifer.com/3O5Ir.gif',
      'https://i.gifer.com/3O5Ip.gif',
      'https://i.gifer.com/3O5Iq.gif'
    ],
    doubleReplies: [
      '{author} делает точно выстрел в {target}, вызывайте скорую! ＼(º □ º l|l)/'
    ]
  },
  {
    name: 'ударить',
    flag: 0b010,
    aliases: [],
    description: 'задеть',
    images: [
      'https://i.imgur.com/Xor7pki.gif',
      'https://i.imgur.com/qIMz7xc.gif',
      'https://i.imgur.com/NdRJ7nN.gif',
      'https://i.imgur.com/17hFjiL.gif',
      'https://i.imgur.com/nYqKJnU.gif',
      'https://i.imgur.com/cTQINZE.gif',
      'https://i.imgur.com/0mWRFPi.gif',
      'https://i.imgur.com/o2daWIB.gif',
      'https://i.imgur.com/OnJ6QgW.gif',
      'https://i.imgur.com/bfv3riv.gif',
      'https://i.gifer.com/3O5Kc.gif',
      'https://i.gifer.com/3O5Kf.gif',
      'https://i.gifer.com/3O5Ke.gif',
      'https://i.gifer.com/3O5Kg.gif',
      'https://i.gifer.com/3O5Kd.gif',
      'https://i.gifer.com/3O5Kh.gif'
    ],
    doubleReplies: [
      'Осторожно! {author} бьёт {target}, начинается драка! 〣( ºΔº )〣'
    ]
  },
  {
    name: 'взорвать',
    flag: 0b010,
    aliases: [],
    description: 'уничтожить юзера',
    images: [
      'https://imgur.com/EVTgsy4.gif',
      'https://imgur.com/EokrA0F.gif',
      'https://imgur.com/5L29aMP.gif',
      'https://imgur.com/YGQMBno.gif'
    ],
    doubleReplies: [
      '{author} взорвал {target}. Он(а) наверно помер(ла)... ╰(゜益゜)╯'
    ]
  },
  {
    name: 'задушить',
    flag: 0b010,
    aliases: [],
    images: [
      'https://imgur.com/11L5fGT.gif',
      'https://imgur.com/4zScUcH.gif',
      'https://imgur.com/RrMk0hX.gif'
    ],
    doubleReplies: ['{author} задушил(а) {target}. Минус челикс... ╰(゜益゜)╯']
  },
  {
    name: 'согреться',
    flag: 0b0100,
    aliases: [],
    images: [
      'https://imgur.com/VTmQAM2.gif',
      'https://imgur.com/IdmX86J.gif',
      'https://imgur.com/QTaePsO.gif',
      'https://imgur.com/P8YraKR.gif'
    ],
    singleReplies: ['{author} греется у костра ୧ʕ•̀ᴥ•́ʔ୨']
  },
  {
    name: 'фейерверк',
    flag: 0b0100,
    aliases: [],
    images: [
      'https://imgur.com/oA8ugzB.gif',
      'https://imgur.com/aaEu4Du.gif',
      'https://imgur.com/CC2iJ6d.gif',
      'https://imgur.com/jKB8ijM.gif'
    ],
    singleReplies: [
      '{author} выстрелил(а) фейерверком.. Как же это красиво... ໒( ˵ •̀ □ •́ ˵ )७'
    ]
  },
  {
    name: 'ледяной каток',
    flag: 0b0100,
    aliases: [],
    images: [
      'https://imgur.com/XJs6Ksa.gif',
      'https://imgur.com/6JR3MXV.gif',
      'https://imgur.com/DlVXLIK.gif',
      'https://imgur.com/IWTiZsh.gif'
    ],
    singleReplies: ['{author} прокатился(ась) на ледяном катке.']
  },
  {
    name: 'сияние',
    flag: 0b0100,
    aliases: [],
    images: [
      'https://imgur.com/9o7zOeP.gif',
      'https://imgur.com/Ewgcuv8.gif',
      'https://imgur.com/wH35U6y.gif'
    ],
    singleReplies: ['{author} смотрит на северное сияние.']
  },
  {
    name: 'кинуть снежок',
    flag: 0b0100,
    aliases: [],
    images: [
      'https://imgur.com/XeDVuF2.gif',
      'https://imgur.com/5BCvEjW.gif',
      'https://imgur.com/Ma4yyWD.gif'
    ],
    singleReplies: ['{author} начал(а) обстрел снежками. ୧ʕ•̀ᴥ•́ʔ୨']
  },
  {
    name: 'хоровод',
    flag: 0b0100,
    aliases: [],
    images: ['https://imgur.com/gQnsXvr.gif', 'https://imgur.com/OVnoMo5.gif'],
    singleReplies: ['{author} посмотрите как ритмично он(а) двигается']
  },
  {
    name: 'съесть мандарин',
    flag: 0b0100,
    aliases: [],
    images: [
      'https://imgur.com/O9qsU5o.gif',
      'https://imgur.com/2dZuaMd.gif',
      'https://imgur.com/A1hgHDl.gif'
    ],
    singleReplies: ['{author} Съел(а) мандаринку. Омномномヽ(ಠ▃ಠ)ﾉ']
  },
  {
    name: 'угостить мандарином',
    flag: 0b0100,
    aliases: [],
    images: [
      'https://imgur.com/O9qsU5o.gif',
      'https://imgur.com/2dZuaMd.gif',
      'https://imgur.com/A1hgHDl.gif'
    ],
    doubleReplies: ['{author} Угостила {target} мандаринкой.. Омномномヽ(ಠ▃ಠ)ﾉ']
  }
]

export default reactions
