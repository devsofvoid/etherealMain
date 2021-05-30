import {
    GuildMember,
    Message,
    MessageEmbed,
    MessageReaction,
    User
} from 'discord.js';

import Command from '../../structures/Command'
import auction, { AuctionDoc } from '../../models/raw/Auction';
import * as Util from "../../utils/util";
import {config} from "../../main";

const firstPageIcon = '⏪';
const prevPageIcon = '◀';
const deleteIcon = '🗑';
const nextPageIcon = '▶';
const lastPageIcon = '⏩';

let totalPages = 0;
const maxRolesOnPage = 5;

export default class AuctionCommand extends Command {
    get options() {
        return {
            name: 'магазин'
        }
    }
    get cOptions() {
        return { guildOnly: true }
    }

    public async renderPage (message: Message, member: GuildMember, rows: AuctionDoc[], page: number): Promise<MessageEmbed> {
        let row = null;
        let auctionString = '';

        for (let index = 0; index < rows.length && index < maxRolesOnPage; index++) {
            row = rows[index + maxRolesOnPage * (page - 1)];

            if (row) {
                const role = member.guild.roles.cache.get(row['roleId']);
                const roleOwner = await message.member!.guild.members.fetch(row['userId']).catch();
                const price = row['price'];

                auctionString += `**${index + maxRolesOnPage * (page - 1) + 1})**・<:selling:842763575734697984>・${role ? role.name : row['roleId']}\n**Продавец:** ${roleOwner ? roleOwner.toString() : row['userId']}\n**Цена:** ${price}${Util.resolveEmoji(config.meta.emojis.cy).trim()}\n`;
            }
        }

        const InventoryEmbed = new MessageEmbed()
            .setColor(3092790)
            .setTitle('**Магазин личных ролей**')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setDescription(rows.length ? auctionString : 'Магазин **пуст**');
        if (message.member!.id !== member.id) InventoryEmbed.setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: 'png' }));
        if (totalPages > 1) InventoryEmbed.setFooter(`Страница ${page} из ${totalPages}`);

        return InventoryEmbed;
    }

    async execute(message: Message, args: string[]) {
        const member = (await Util.resolveMember(args[0])) || message.member!;

        const rows = await auction.find();

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
