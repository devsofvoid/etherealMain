import {Message, MessageEmbed} from 'discord.js'

import Command from '../../structures/Command'
import auction from '../../models/raw/Auction';
import tempRoles from '../../models/raw/TempRole';
import {config} from "../../main";

export default class InfoRoleCommand extends Command {
    get options() {
        return {
            name: 'инфороль'
        }
    }
    get cOptions() {
        return { guildOnly: true }
    }

    async execute(message: Message, args: string[]): Promise<any> {
        const role = message.mentions.roles?.first() || message.guild!.roles.cache.get(args[0]);
        if (!role) return message.channel.send({
            embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({dynamic: true, format: 'png'})
                },
                description: 'Роль не найдена'
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});

        const tempRoleRow = await tempRoles.findOne({
            roleId: role.id
        });
        if (!tempRoleRow) return message.channel.send({
            embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({dynamic: true, format: 'png'})
                },
                description: `Роль ${role.toString()} **не** является личной`
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});
        const roleOwner = await message.member!.guild.members.fetch(tempRoleRow['userID']).catch();
        const isRoleSelling = await auction.findOne({
            roleId: tempRoleRow['roleID']
        });
        const endDate = new Date(tempRoleRow['endTick']!);

        const embed = new MessageEmbed()
            .setColor(config.meta.defaultColor)
            .setThumbnail(message.author.displayAvatarURL({dynamic: true, format: 'png'}))
            .setDescription(`・**Роль:** ${role.toString()}
            ・**Владелец:** ${roleOwner || tempRoleRow['userID']}
            ・**Носителей:** \`${tempRoleRow['customMembers']!.length + 1}\`
            ・**Продана раз:** \`${tempRoleRow['soldTimes']}\`
            ・**Продается:** \`${isRoleSelling ? 'Да' : 'Нет'}\`
            
            >>> **ID роли:** \`${role.id}\`
            **Цвет роли:** \`${role.hexColor}\`
            **Действует до:** \`${endDate.getDate()}.${endDate.getMonth() + 1}.${endDate.getFullYear()}\``)
        return message.channel.send(embed);
    }
}
