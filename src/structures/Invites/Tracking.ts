import chalk = require('chalk');
import { Guild, GuildAuditLogs, GuildMember, Invite, PartialGuildMember } from 'discord.js';
import * as os from 'os'
import { config, invites, vanity } from '../../main';
import { InviteCodes, Joins } from '../../utils/db';
import { Service } from './services/Service';
import { deconstruct, discordRetryHandler } from '../../utils/util'
import { JoinInvalidatedReason } from './Invites';
const GUILDS_IN_PARALLEL = os.cpus().length;
export class TrackingService extends Service {
    public pendingGuilds: Set<string> = new Set();
    public initialPendingGuilds: number = 0;

    private inviteStore: {
        [guildId: string]: { [code: string]: { uses: Number; maxUses: number } };
    } = {};
    private inviteStoreUpdate: { [guildId: string]: number } = {};

    public async init() {
        this.core.on('inviteCreate', this.onInviteCreate.bind(this));
        this.core.on('inviteDelete', this.onDeleteInvite.bind(this));
        this.core.on('guildMemberAdd', this.onGuildMemberAdd.bind(this));
        this.core.on('guildMemberRemove', this.onGuildMemberRemove.bind(this));
    }
    public async onClientReady() {
        if (!this.core) return
        if (this.core!.readyAt == null) {
            return;
        }

        console.log(`Requesting ${chalk.blue(GUILDS_IN_PARALLEL)} guilds in parallel during startup`);

        // Save all guilds, sort descending by member count
        // (Guilds with more members are more likely to get a join)
        const allGuilds = [...this.core.guilds.cache.values()].sort((a, b) => b.memberCount - a.memberCount);

        // Fetch all invites from DB
        const allCodes = await InviteCodes.fetch();

        // Initialize our cache for each guild, so we
        // don't need to do any if checks later
        allGuilds.forEach((guild) => {
            this.pendingGuilds.add(guild.id);
            this.inviteStore[guild.id] = {};
        });

        // Update our cache to match the DB
        allCodes.forEach(
            (inv) =>
            (this.inviteStore[inv.guildId][inv.code] = {
                uses: inv.uses || 0,
                maxUses: inv.maxUses
            })
        );

        this.initialPendingGuilds = allGuilds.length;
        for (let j = 0; j < GUILDS_IN_PARALLEL; j++) {
            const func = async () => {
                const guild = allGuilds.shift();

                if (!guild) {
                    if (allGuilds.length) {
                        console.error('Guild in pending list was null but list is not empty');
                    }
                    return;
                }

                try {
                    await this.insertGuildData(guild);
                } catch (err) {
                    console.error(err);
                }

                console.log(`Updated invite count for ${chalk.blue(guild.name)}`);

                this.pendingGuilds.delete(guild.id);
                if (this.pendingGuilds.size % 50 === 0) {
                    console.log(`Pending: ${chalk.blue(`${this.pendingGuilds.size}/${this.initialPendingGuilds}`)}`);
                }

                if (this.pendingGuilds.size === 0) {
                    console.log(chalk.green(`Loaded all pending guilds!`));
                    this.startupDone();
                }

                setTimeout(func, 0);
            };
            // tslint:disable-next-line: no-floating-promises
            func();
        }
    }

    private async onInviteCreate(invite: Invite) {
        await InviteCodes.insertOne(
            {
                createdAt: invite.createdAt ? new Date(invite!.createdAt).getTime() : Date.now(),
                code: invite.code,
                channelId: invite.channel ? invite.channel.id : null,
                maxAge: invite.maxAge,
                maxUses: invite.maxUses,
                uses: invite.uses,
                temporary: invite.temporary,
                guildId: invite.guild!.id,
                inviterId: invite.inviter ? invite.inviter.id : null,
                clearedAmount: 0,
                isVanity: false,
                isWidget: false
            }
        );
    }

    private async onDeleteInvite(invite: Invite) {
        await InviteCodes.insertOne(
            {
                createdAt: invite.createdAt ? new Date(invite!.createdAt).getTime() : Date.now(),
                code: invite.code,
                channelId: invite.channel ? invite.channel.id : null,
                maxAge: invite.maxAge,
                maxUses: invite.maxUses,
                uses: invite.uses,
                temporary: invite.temporary,
                guildId: invite.guild!.id,
                inviterId: invite.inviter ? invite.inviter.id : null,
                clearedAmount: 0,
                isVanity: false,
                isWidget: false
            }
        );
    }
    private async onGuildMemberAdd(member: GuildMember | PartialGuildMember) {
        const guild = member.guild;
        if (member.user!.bot) return;

        // If we don't have manage server then what are we even doing here and why did you invite our bot
        if (!guild.members.cache.get(this.core.user!.id)!.hasPermission("MANAGE_GUILD")) {
            console.error(`BOT DOESN'T HAVE MANAGE SERVER PERMISSIONS FOR ${guild.id} ON MEMBERADD`);
            return;
        }
        let invs: Invite[] = await discordRetryHandler(
            `/guilds/${guild.id}/invites`,
            {
                method: 'GET',
                headers: {
                    authorization: `${this.core ? 'Bot ' : ''}${this.core.token}`
                }
            }
        ).then((invites) => [...invites.map((invite: object) => new Invite(this.core, invite))]);
        const lastUpdate = this.inviteStoreUpdate[guild.id];
        const newInvs = this.getInviteCounts(invs);
        const oldInvs = this.inviteStore[guild.id];

        this.inviteStore[guild.id] = newInvs;
        this.inviteStoreUpdate[guild.id] = Date.now();

        if (!oldInvs) {
            console.error('Invite cache for guild ' + guild.id + ' was undefined when adding member ' + member.id);
            return;
        }

        let exactMatchCode: string = '';
        let inviteCodesUsed = this.compareInvites(oldInvs, newInvs);

        if (
            inviteCodesUsed.length === 0 &&
            guild.members.cache.get(this.core.user!.id)!.hasPermission("VIEW_AUDIT_LOG")
        ) {
            const logs = await guild.fetchAuditLogs({ limit: 50, before: undefined, type: 'INVITE_CREATE' }).catch(() => null as unknown as GuildAuditLogs);
            if (logs && logs.entries.size) {
                const createdCodes = logs.entries
                    .filter((e) => deconstruct(e.id) > lastUpdate && newInvs[e.changes!.find(x => x.key == "code")?.new] === undefined)
                    .map((e) => ({
                        code: e.changes!.find(x => x.key == "code")?.new,
                        channel: {
                            id: e.changes!.find(x => x.key == "channel_id")?.new,
                            name: ""
                        },
                        inviter: e.executor.id,
                        uses: (e.changes!.find(x => x.key == "uses")?.new as number) + 1,
                        maxUses: e.changes!.find(x => x.key == "max_uses")?.new,
                        maxAge: e.changes!.find(x => x.key == "max_age")?.new,
                        temporary: e.changes!.find(x => x.key == "temporary")?.new,
                        createdAt: deconstruct(e.id)
                    }));
                inviteCodesUsed = inviteCodesUsed.concat(createdCodes.map((c) => c.code));
                invs = invs.concat(createdCodes as any);
            }
        }

        let isVanity = false;
        if (inviteCodesUsed.length === 0) {
            const vanityInv = await vanity.get(guild.id);
            if (vanityInv) {
                isVanity = true;
                inviteCodesUsed.push(vanityInv);
                invs.push({
                    code: vanityInv,
                    channel: null,
                    guild,
                    inviter: null,
                    uses: 0,
                    maxUses: 0,
                    maxAge: 0,
                    temporary: false,
                    vanity: true
                } as any);
            }
        }

        if (inviteCodesUsed.length === 0) {
            console.error(
                `NO USED INVITE CODE FOUND: g:${guild.id} | m: ${member.id} ` +
                `| t:${member.joinedAt} | invs: ${JSON.stringify(newInvs)} ` +
                `| oldInvs: ${JSON.stringify(oldInvs)}`
            );
        }

        if (inviteCodesUsed.length === 1) {
            exactMatchCode = inviteCodesUsed[0];
        }

        const updatedCodes: string[] = [];
        // These are all used codes, and all new codes combined.
        const newAndUsedCodes = inviteCodesUsed
            .map((code) => {
                const inv = invs.find((i) => i.code === code);
                if (inv) {
                    return inv;
                }
                updatedCodes.push(code);
                return null;
            })
            .filter((inv) => !!inv)
            .concat(invs.filter((inv) => !oldInvs[inv.code]));


        const codes = newAndUsedCodes.map((inv) => ({
            createdAt: inv!.createdAt ? new Date(inv!.createdAt).getTime() : Date.now(),
            code: inv!.code,
            channelId: inv!.channel ? inv!.channel.id : null,
            isNative: !inv!.inviter || inv!.inviter.id !== this.core!.user!.id,
            maxAge: inv!.maxAge,
            maxUses: inv!.maxUses,
            uses: inv!.uses,
            temporary: inv!.temporary,
            guildId: guild.id,
            inviterId: inv!.inviter ? inv!.inviter.id : null,
            clearedAmount: 0,
            isVanity: !!(inv! as any).vanity,
            isWidget: !inv!.inviter && !(inv! as any).vanity
        }));

        // Update old invite codes that were used
        if (updatedCodes.length > 0) {
            InviteCodes.updateMany({ code: updatedCodes }, { $inc: { uses: 1 } });
        }

        // We need the invite codes in the DB for the join
        if (codes.length > 0) {
            codes.forEach(async (inv) => {
                const invite = await InviteCodes.getOne({ code: inv.code })
                invite.createdAt = inv.createdAt ? new Date(inv!.createdAt).getTime() : Date.now()
                invite.channelId = inv.channelId
                invite.maxAge = inv.maxAge
                invite.maxUses = inv.maxUses
                invite.uses = inv.uses
                invite.temporary = inv.temporary
                invite.guildId = guild.id
                invite.inviterId = inv.inviterId
                invite.clearedAmount = 0
                invite.isVanity = !!(inv as any).vanity
                invite.isWidget = !inv.inviterId && !(inv as any).vanity
                invite.save()
            })
        }

        // Insert the join
        let joinId: string = '';
        if (exactMatchCode) {
            await Joins.insertOne({
                exactMatchCode: exactMatchCode,
                memberId: member.id,
                guildId: guild.id,
                createdAt: new Date(member.joinedAt || 0).getTime(),
                invalidatedReason: Date.now() - member.user?.createdTimestamp! < config.meta.minimumAccountTime ? JoinInvalidatedReason.fake : null,
                cleared: false
            })
        }

        const removedLeaves = (await Joins.updateMany({ guildId: guild.id, invalidatedReason: 'leave', memberId: member.id }, { invalidatedReason: null }))?.length
        const invite = newAndUsedCodes.find((c) => c!.code === exactMatchCode);

        // Exit if we can't find the invite code used
        if (!invite || isVanity)
            return;

        // If user created less than 12 hours ago let's assume it's a fake account
        const newFakes = Date.now() - member.user?.createdTimestamp! < config.meta.minimumAccountTime ?
            (await Joins.updateMany({ guildId: guild.id, invalidatedReason: null, memberId: member.id, _id: { $ne: joinId } }, { invalidatedReason: 'fake' }))?.length
            : -((await Joins.updateMany({ guildId: guild.id, invalidatedReason: 'fake', memberId: member.id, _id: { $ne: joinId } }, { invalidatedReason: null }))?.length!)

        // Check if it's a server widget
        if (!invite.inviter) return;

        const invitesCached = invites.hasOne(guild.id, invite.inviter.id);

        const inv = await invites.getOne(guild.id, invite.inviter.id);

        if (invitesCached) {
            inv.regular++;
            inv.fake += newFakes || 0;
            inv.leave += removedLeaves || 0;
            inv.total = inv.regular + inv.custom + inv.fake + inv.leave;
        }
    }
    private async onGuildMemberRemove(member: GuildMember | PartialGuildMember) {
        const guild = member.guild;
        if (member.user!.bot) return;

        const join = await Joins.findOne({ guildId: guild.id, memberId: member.id })

        if (join) {
            join.invalidatedReason = JoinInvalidatedReason.leave
            join.save();
        }
        // Exit if we can't find the join
        if (!join || !join.exactMatchCode) {
            console.log(`Could not find join for ${member.id} in ` + `${guild.id}`);
            return;
        }
        const invite = await invites.getOne(guild.id, join.inviterId);
        invite.leave++;
        invite.total = invite.regular + invite.custom + invite.fake + invite.leave;
    }
    public async insertGuildData(guild: Guild) {
        if (!guild.members.cache.get(this.core.user!.id)!.permissions.has('MANAGE_GUILD')) {
            console.error(`BOT DOESN'T HAVE MANAGE SERVER PERMISSIONS FOR ${guild.id} ON INSERT`);
            return;
        }

        // Get the invites
        const invs: Invite[] = await discordRetryHandler(
            `/guilds/${guild.id}/invites`,
            {
                method: 'GET',
                headers: {
                    authorization: `${this.core ? 'Bot ' : ''}${this.core.token}`
                }
            }
        ).then((invites) => [...invites.map((invite: object) => new Invite(this.core, invite))]);
        // Filter out new invite codes
        const newInviteCodes = invs.filter(
            (inv: any) => this.inviteStore[inv.guild!.id] === undefined || this.inviteStore[inv.guild!.id][inv.code] === undefined
        );

        // Update our local cache
        this.inviteStore[guild.id] = this.getInviteCounts(invs);
        this.inviteStoreUpdate[guild.id] = Date.now();

        const vanityInv = await vanity.get(guild.id);
        if (vanityInv) {
            newInviteCodes.push({
                code: vanityInv,
                channel: null,
                guild,
                inviter: null,
                uses: 0,
                maxUses: 0,
                maxAge: 0,
                temporary: false,
                vanity: true
            } as any);
        }

        // Then insert invite codes
        invs.forEach(async inv => {
            const invite = await InviteCodes.getOne({ code: inv.code })
            invite.createdAt = inv.createdAt ? new Date(inv!.createdAt).getTime() : Date.now(),
                invite.channelId = inv.channel ? inv.channel.id : null,
                invite.maxAge = inv.maxAge,
                invite.maxUses = inv.maxUses,
                invite.uses = inv.uses,
                invite.temporary = inv.temporary,
                invite.guildId = guild.id,
                invite.inviterId = inv.inviter ? inv.inviter.id : null,
                invite.clearedAmount = 0,
                invite.isVanity = !!(inv as any).vanity,
                invite.isWidget = !inv.inviter && !(inv as any).vanity
            invite.save()
        })
    }
    private getInviteCounts(invites: Invite[]): { [key: string]: { uses: number; maxUses: number } } {
        const localInvites: {
            [key: string]: { uses: number; maxUses: number };
        } = {};
        invites.forEach((value) => {
            localInvites[value.code] = { uses: value.uses ?? 0, maxUses: value.maxUses ?? 0 };
        });
        return localInvites;
    }
    private compareInvites(
        oldObj: { [key: string]: { uses: Number; maxUses: number } },
        newObj: { [key: string]: { uses: number; maxUses: number } }
    ): string[] {
        const inviteCodesUsed: string[] = [];
        Object.keys(newObj).forEach((key) => {
            if (
                newObj[key].uses !== 0 /* ignore new empty invites */ &&
                (!oldObj[key] || oldObj[key].uses < newObj[key].uses)
            ) {
                inviteCodesUsed.push(key);
            }
        });
        // Only check for max uses if we can't find any others
        if (inviteCodesUsed.length === 0) {
            Object.keys(oldObj).forEach((key) => {
                if (!newObj[key] && oldObj[key].uses === oldObj[key].maxUses - 1) {
                    inviteCodesUsed.push(key);
                }
            });
        }
        return inviteCodesUsed;
    }

}

