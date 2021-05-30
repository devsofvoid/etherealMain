import { Message } from 'discord.js'

import Command from '../../structures/Command'
import hiddenRoles from '../../models/raw/HiddenRoles';
import tempRoles from '../../models/raw/TempRole';
import { config } from '../../main'

export default class HideCommand extends Command {
    get options() {
        return {
            name: 'спрятать'
        }
    }
    get cOptions() {
        return { guildOnly: true }
    }

    async execute(message: Message, args: string[]): Promise<any>  {
        const role = message.mentions.roles?.first() || message.guild!.roles.cache.get(args[0]);
        if (!role) return message.channel.send({ embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({ dynamic: true, format: 'png' })
                },
                description: 'Роль не найдена'
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});

        if (!message.member!.roles.cache.has(role.id)) return message.channel.send({ embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({ dynamic: true, format: 'png' })
                },
                description: `У Вас **нет** роли ${role.toString()}`
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});
        if (!await tempRoles.find({ $or: [{ customMembers: { $elemMatch: { id: message.author.id } } }, { userID: message.author.id }] })) return message.channel.send({ embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({ dynamic: true, format: 'png' })
                },
                description: `Роль ${role.toString()} **нельзя** спрятать`
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});
        if (await hiddenRoles.findOne({ userId: message.author.id, roleId: role.id })) return message.channel.send({ embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({ dynamic: true, format: 'png' })
                },
                description: `Роль ${role.toString()} **уже** находится в Вашем инвентаре`
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});

        await hiddenRoles.create({
            userId: message.author.id,
            roleId: role.id
        });

        if (message.member!.roles.cache.has(role.id)) await message.member!.roles.remove(role);

        return message.channel.send({ embed: {
                title: "H I D E  R O L E",
                description: `Ты успешно спрятал(а) свою роль!\n> ${role.toString()}`,
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
