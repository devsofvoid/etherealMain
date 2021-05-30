import { Cache } from './Cache';
import { InviteCounts, } from '../Invites';
import { invs } from '../../../main';

export class InvitesCache extends Cache<Map<string, InviteCounts>> {
    public async init() {
        this.maxCacheDuration = Date.now();
    }

    protected async _get(): Promise<Map<string, InviteCounts>> {
        const map = new Map();
        return map;
    }

    public async getOne(guildId: string, memberId: string) {
        const guildInvites = await this.get(guildId);
        let invites = guildInvites.get(memberId);
        if (!invites) {
            invites = await invs.getInviteCounts(guildId, memberId);
            guildInvites.set(memberId, invites);
        }
        return invites;
    }

    public hasOne(guildId: string, memberId: string) {
        const map = this.cache.get(guildId);
        return map && map.has(memberId);
    }

    public flushOne(guildId: string, memberId: string) {
        const map = this.cache.get(guildId);
        if (map) {
            map.delete(memberId);
        }
    }
}
