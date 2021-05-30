import { Message } from 'discord.js'

import Command from '../../structures/Command'
import hiddenRoles from '../../models/raw/HiddenRoles';
import { config } from '../../main'

export default class EquipCommand extends Command {
    get options() {
        return {
            name: 'отобразить'
        }
    }
    get cOptions() {
        return { guildOnly: true }
    }

    async execute(message: Message, args: string[]): Promise<any>  {
        if (!args[0] || !Number.isInteger(args[0])) return message.channel.send({ embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({ dynamic: true, format: 'png' })
                },
                description: `Индефикатор роли **не** найден`
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});

        const rows = await hiddenRoles.find({ userId: message.author.id }).exec();
        const row = rows[parseInt(args[0])];

        if (!row) return message.channel.send({ embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({ dynamic: true, format: 'png' })
                },
                description: `**Роль** с таким индефикатором **не** найдена`
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});

        await hiddenRoles.deleteOne({
                userId: message.author.id,
                roleId: row['roleId']
        });

        if (message.member!.guild.roles.cache.get(row['roleId']) && !message.member!.roles.cache.has(row['roleId'])) await message.member!.roles.add(row['roleId']);

        return message.channel.send({ embed: {
                description: `Ты открыл(а) отображение роли!\n> ${message.member!.guild.roles.cache.get(row['roleId'])!.toString()}`,
                color: 3092790,
                footer: {
                    text: message.author.tag,
                    icon_url: message.guild!.iconURL({ dynamic: true, format: 'png' }) || ''
                },
                timestamp: new Date(),
                thumbnail: {
                    url: message.author.displayAvatarURL({ dynamic: true, format: 'png' })
                }
            }
        })
    }
}
