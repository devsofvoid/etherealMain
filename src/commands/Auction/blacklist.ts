import { Message } from 'discord.js'

import Command from '../../structures/Command'
import auction from '../../models/raw/Auction'
import * as Util from "../../utils/util";
import {config} from "../../main";

export default class BlacklistCommand extends Command {
    get options() {
        return { name: 'чёрныйсписок' }
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
        const target = await Util.resolveMember(args[1]);
        if (!target) return message.channel.send({
            embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({dynamic: true, format: 'png'})
                },
                description: 'Участник не найден'
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

        const blacklist = row['blackList'];
        if (blacklist.includes(target.id)) {
            const index = blacklist.indexOf(message.author.id);
            blacklist.splice(index, 1);
            row.update({ blackList: blacklist });
            return message.channel.send({ embed: {
                    description: `${message.member!.toString()}, **Вы удалили из чёрного списока: ${target.toString()}**`,
                    color: 3092790,
                    footer: {
                        text: message.author.tag,
                        icon_url: message.author.displayAvatarURL({ dynamic: true, format: 'png' })
                    },
                    timestamp: new Date()
                } })
        } else {
            blacklist.push(target.id);
            row.update({ blackList: blacklist });
            return message.channel.send({ embed: {
                    description: `${message.member!.toString()}, **Вы добавили в чёрный список: ${target.toString()}**`,
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
}
