import {
    GuildMember,
    Message,
    MessageEmbed,
    MessageReaction,
    User
} from 'discord.js';

import Command from '../../structures/Command'
import hiddenRoles  from '../../models/raw/HiddenRoles';
import auction from '../../models/raw/Auction';
import tempRoles, { TempRoleDoc } from '../../models/raw/TempRole';
import * as Util from "../../utils/util";

const firstPageIcon = '⏪';
const prevPageIcon = '◀';
const deleteIcon = '🗑';
const nextPageIcon = '▶';
const lastPageIcon = '⏩';

let totalPages = 0;
const maxRolesOnPage = 10;

export default class RolesCommand extends Command {
    get options() {
        return {
            name: 'роли'
        }
    }
    get cOptions() {
        return { guildOnly: true }
    }

    public async renderPage (message: Message, member: GuildMember, rows: TempRoleDoc[], page: number): Promise<MessageEmbed> {
        let row = null;
        let inventory = '';

        for (let index = 0; index < rows.length && index < maxRolesOnPage; index++) {
            row = rows[index + maxRolesOnPage * (page - 1)];

            if (row) {
                const role = member.guild.roles.cache.get(row['roleID']);
                const isRoleSelling = await auction.findOne({
                    roleId: row['roleID']
                });
                const roleOwner = await message.member!.guild.members.fetch(row['userID']).catch();
                const isRoleHidden = await hiddenRoles.findOne({
                    userId: member.id,
                    roleId: row['roleID']
                });

                inventory += `**${index + maxRolesOnPage * (page - 1) + 1})**・${isRoleHidden ? '<:hide:842773828232806431>' : '<:selling:842763575734697984>'}・${role ? role.toString() : row['roleID']} — ${isRoleSelling ? '`Продается`・' : ''} \`Владелец${roleOwner?.id === member.id ? '' : roleOwner.user.tag}\`\n`;
            }
        }

        const InventoryEmbed = new MessageEmbed()
            .setColor(3092790)
            .setTitle(message.member!.id === member.id ? '**Инвентарь ролей**' : `**Инвентарь ролей ${member.user.tag}**`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png' }))
            .addFields([
                {
                    name: '\u200B',
                    value: `\`${this.client.prefix}спрятать [ID | @ЛИНК]\``,
                    inline: true
                },
                {
                    name: '\u200B',
                    value: `\`${this.client.prefix}отобразить [№ роли в инвентаре]\``,
                    inline: true
                }
            ])
            .setDescription(rows.length ? inventory : 'Инвентарь **пуст**');
        if (message.member!.id !== member.id) InventoryEmbed.setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: 'png' }));
        if (totalPages > 1) InventoryEmbed.setFooter(`Страница ${page} из ${totalPages}`);

        return InventoryEmbed;
    }

    async execute(message: Message, args: string[]) {
        const member = (await Util.resolveMember(args[0])) || message.member!;

        const rows = await tempRoles.find({
            $or: [{ customMembers: { $elemMatch: { id: member.id } } }, { userID: member.id }]
        });

        totalPages = Math.ceil(rows.length / Math.abs(maxRolesOnPage));

        const response = await this.renderPage(message, member, rows, 1);
        if (!response) return;

        return message.channel.send(response).then(async msg => {
            const timeout = setTimeout(() => {
                if (msg.deletable) msg.reactions.removeAll();
            }, 30000);

            if (totalPages > 1) {
                await msg.react(firstPageIcon).catch(console.error);
                await msg.react(prevPageIcon).catch(console.error);
                await msg.react(deleteIcon).catch(console.error);
                await msg.react(nextPageIcon).catch(console.error);
                await msg.react(lastPageIcon).catch(console.error);

                const filter = (react: MessageReaction, user: User) =>
                    (react.emoji.name === firstPageIcon ||
                        react.emoji.name === prevPageIcon ||
                        react.emoji.name === deleteIcon ||
                        react.emoji.name === nextPageIcon ||
                        react.emoji.name === lastPageIcon)
                    && user.id === message.author.id;
                const collector = msg.createReactionCollector(filter);

                let page = 1;

                collector.on('collect', async reaction => {
                    reaction.users.remove(message.member!).catch(console.error);

                    switch (reaction.emoji.toString()) {
                        case deleteIcon:
                            if (msg.deletable) await msg.delete();
                            clearTimeout(timeout);
                            break;

                        case firstPageIcon:
                            msg.edit(await this.renderPage(message, member, rows, 1)).then(() => (page = 1));
                            break;

                        case lastPageIcon:
                            msg.edit(await this.renderPage(message, member, rows, totalPages)).then(() => (page = totalPages));
                            break;

                        case prevPageIcon:
                            if (page - 1 === 0) return;
                            msg.edit(await this.renderPage(message, member, rows, page - 1)).then(() => page--);
                            break;

                        case nextPageIcon:
                            if (page + 1 > totalPages) return;
                            msg.edit(await this.renderPage(message, member, rows, page + 1)).then(() => page++);
                            break;
                    }
                });
            }
        });
    }
}
