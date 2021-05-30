import { Core } from 'discore.js'
import { existsSync, readFileSync } from 'fs'

if (existsSync('./.env')) {
  readFileSync('./.env', 'utf8')
    .toString()
    .split(/\n|\r|\r\n/)
    .forEach(e => {
      const keyValueArr = e.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (keyValueArr != null) {
        process.env[keyValueArr[1]] = keyValueArr[2]
      }
    })
}

import * as conf from './config'
import * as debugConf from './debugConfig'

// process.env.Debug = '1'
export const config = typeof process.env.Debug == 'string' ? debugConf : conf
import db from './utils/db'
import Collection from './structures/Collection'

import * as Util from './utils/util'

import { CloseData, EventData, PrivateRoomData } from './utils/types'
import { VanityUrlCache } from './structures/Invites/cache/VanityUrlCache'
import { InvitesService } from './structures/Invites/Invites'
import { InvitesCache } from './structures/Invites/cache/InvitesCache'
import { TrackingService } from './structures/Invites/Tracking'

require('events').EventEmitter.defaultMaxListeners = 0

const client = new Core({
  db,
  ws: { intents: config.intents },
  token:
    config.internal.token.length > 0
      ? config.internal.token
      : process.env.CLIENT_TOKEN,
  prefix: '',
  commandOptions: {
    argsSeparator: ' ',
    ignoreBots: true,
    ignoreCase: true,
    ignoreSelf: true
  }
})

export default client

export const events = new Collection<string, EventData>()
export const closes = new Collection<string, CloseData>()
export const privaterooms = new Collection<string, PrivateRoomData>()
export const activePairOffers = new Set<string>()
export const activeClanDeletions = new Set<string>()
export const cachedRooms = new Map<string, number>()

export const vanity = new VanityUrlCache(client)
export const invs = new InvitesService(client)
export const invites = new InvitesCache(client)
export const tracking = new TrackingService(client)
Util.disableEvents()
// Util.patchManagers()
Util.processPrefixes()
Util.fetchPrivaterooms()
