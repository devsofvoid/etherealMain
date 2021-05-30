
import { CustomInvites, InviteCodes, Joins } from '../../utils/db';
import { Service } from './services/Service';

export interface LeaderboardEntry {
    id: string;
    name: string;
    discriminator: string;
    total: number;
    regular: number;
    custom: number;
    fakes: number;
    leaves: number;
}
export enum JoinInvalidatedReason {
    fake = 'fake',
    leave = 'leave'
}

export interface InviteCounts {
    regular: number;
    custom: number;
    fake: number;
    leave: number;
    total: number;
}

export class InvitesService extends Service {
    public async getInviteCounts(guildId: string, memberId: string): Promise<InviteCounts> {
        const regular = await InviteCodes.filter(x => x.guildId == guildId && x.inviterId == memberId && x.uses && x.uses > 0 && x.uses > x.clearedAmount!)
        const custom = (await CustomInvites.filter(x => x.guildId == guildId && x.memberId == memberId && !x.cleared))
        const invCodes = await InviteCodes.filter(x => x.inviterId == memberId).then(async (invite) => {
            const codes = invite.map(x => x.code)
            const [fake, leave] = await Promise.all([
                Joins.filter(x => x.guildId == guildId && x.invalidatedReason == JoinInvalidatedReason.fake && !x.cleared && codes.some(c => x.exactMatchCode == c)),
                Joins.filter(x => x.guildId == guildId && x.invalidatedReason == JoinInvalidatedReason.leave && !x.cleared && codes.some(c => x.exactMatchCode == c))
            ])
            const regularInvites = regular.length > 0 ? regular.map(x => x.uses ? x.uses : 0).reduce((acc, cur) => acc + cur) : 0
            return {
                regular: regularInvites,
                custom: custom.length,
                fake: -fake.length,
                leave: -leave.length,
                total: regularInvites + custom.length + -fake.length + -leave.length
            };
        })
        return invCodes;
    }
    //TODO LATER
    // public async generateLeaderboard(guildId: string) {
    //     const inviteCodePromise = this.client.db.getInviteCodesForGuild(guildId);
    //     const joinsPromise = this.client.db.getJoinsForGuild(guildId);
    //     const customInvitesPromise = this.client.db.getCustomInvitesForGuild(guildId);

    //     // TODO: This is typed as "any" because of a typescript bug https://github.com/microsoft/TypeScript/issues/34925
    //     const [invCodes, js, customInvs]: [any[], any[], any[]] = await Promise.all([
    //         inviteCodePromise,
    //         joinsPromise,
    //         customInvitesPromise
    //     ]);

    //     const entries: Map<string, LeaderboardEntry> = new Map();
    //     invCodes.forEach((inv) => {
    //         const id = inv.id;
    //         entries.set(id, {
    //             id,
    //             name: inv.name,
    //             discriminator: inv.discriminator,
    //             total: Number(inv.total),
    //             regular: Number(inv.total),
    //             custom: 0,
    //             fakes: 0,
    //             leaves: 0
    //         });
    //     });

    //     js.forEach((join) => {
    //         const id = join.id;
    //         let fake = 0;
    //         let leave = 0;
    //         if (join.invalidatedReason === JoinInvalidatedReason.fake) {
    //             fake += Number(join.total);
    //         } else {
    //             leave += Number(join.total);
    //         }
    //         const entry = entries.get(id);
    //         if (entry) {
    //             entry.total -= fake + leave;
    //             entry.fakes -= fake;
    //             entry.leaves -= leave;
    //         } else {
    //             entries.set(id, {
    //                 id,
    //                 name: join.name,
    //                 discriminator: join.discriminator,
    //                 total: -(fake + leave),
    //                 regular: 0,
    //                 custom: 0,
    //                 fakes: -fake,
    //                 leaves: -leave
    //             });
    //         }
    //     });

    //     customInvs.forEach((inv) => {
    //         const id = inv.id;
    //         const custom = Number(inv.total);
    //         const entry = entries.get(id);
    //         if (entry) {
    //             entry.total += custom;
    //             entry.custom += custom;
    //         } else {
    //             entries.set(id, {
    //                 id,
    //                 name: inv.name,
    //                 discriminator: inv.discriminator,
    //                 total: custom,
    //                 regular: 0,
    //                 custom: custom,
    //                 fakes: 0,
    //                 leaves: 0
    //             });
    //         }
    //     });

    //     return [...entries.entries()]
    //         .filter(([k, entry]) => entry.total > 0)
    //         .sort(([, a], [, b]) => {
    //             const diff = b.total - a.total;
    //             return diff !== 0 ? diff : a.name ? a.name.localeCompare(b.name) : 0;
    //         })
    //         .map(([, e]) => e);
    // }
}
