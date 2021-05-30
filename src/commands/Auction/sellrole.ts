import { Message } from 'discord.js'

import Command from '../../structures/Command'
import auction from '../../models/raw/Auction';
import {config} from "../../main";

export default class SellRoleCommand extends Command {
    get options() {
        return { name: 'продатьроль' }
    }
    get cOptions() {
        return { guildOnly: true }
    }

    async execute(message: Message, args: string[]) {
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

        const price = parseInt(args[0]);
        if (!Number.isInteger(price)) return message.channel.send({
            embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({dynamic: true, format: 'png'})
                },
                description: 'Цена роли не найдена'
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});
        if (price < 1000 || price > 15000) return message.channel.send({
            embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({dynamic: true, format: 'png'})
                },
                description: 'Цена роли не может быть меньше **1000** и больше **15000**'
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});

        const row = await auction.findOne({
            userId: message.author.id,
            roleId: role.id
        });
        if (!row) return message.channel.send({
            embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({ dynamic: true, format: 'png' })
                },
                description: `Роли ${role.toString()} **не** является личной или Вы **не** являетесь её владельцем`
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});
        await auction.create({
            userId: message.author.id,
            roleId: role.id,
            price
        });
        return message.channel.send({ embed: {
                description: ` ${message.member!.toString()}, **У нас скоро появиться магнат!**\n> ${role.toString()}`,
                author: {
                    name: "Вы успешно выполнили функцию!"
                },
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
