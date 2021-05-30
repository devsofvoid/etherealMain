import { Message } from 'discord.js'

import Command from '../../structures/Command'
import auction from '../../models/raw/Auction';
import {config} from "../../main";
import User from "../../structures/db/User";

export default class BuyCommand extends Command {
    get options() {
        return {
            name: 'купить'
        }
    }
    get cOptions() {
        return { guildOnly: true }
    }

    async execute(message: Message, args: string[]): Promise<any> {
        const id = parseInt(args[0]);
        if (!Number.isInteger(id)) return message.channel.send({
            embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({dynamic: true, format: 'png'})
                },
                description: 'Номер роли в магазине не найден'
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});
        const rows = await auction.find();

        const row = rows[id - 1];
        if (!row) return message.channel.send({
            embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({dynamic: true, format: 'png'})
                },
                description: `Роли в магазине с номером **${id}** не найдено`
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});

        if (row['blackList'].includes(message.author.id)) return message.channel.send({
            embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({dynamic: true, format: 'png'})
                },
                description: `Вы находитесь в чёрном списке роли`
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});

        if (message.member!.roles.cache.has(row['roleId'])) return message.channel.send({
            embed: {
                color: config.meta.defaultColor,
                thumbnail: {
                    url: message.author.displayAvatarURL({dynamic: true, format: 'png'})
                },
                description: `У Вас **уже** есть эта роль`
            }
        })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {});
        const price = row['price'];
        const priceWithCommission = Math.floor(price - (price / 100 * 20));
        const role = await message.guild!.roles.fetch(row['roleId']).catch();

        const promises = [message.author.id, row['userId']].map(id => {
            return User.get(id)
        })
        const [authorDoc, targetDoc] = await Promise.all(promises)

        if (authorDoc.gold < price) return message.channel.send({
                    embed: {
                        color: config.meta.defaultColor,
                        thumbnail: {
                            url: message.author.displayAvatarURL({dynamic: true, format: 'png'})
                        },
                        description: 'Недостаточно золота на счету'
                    }
                })
                .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
                .catch(() => {});


        await authorDoc.update({gold: authorDoc.gold - price})
        await targetDoc.update({gold: targetDoc.gold + priceWithCommission})

        if (!message.member!.roles.cache.has(row['roleId'])) await message.member!.roles.add(row['roleId']);

        return message.channel.send({ embed: {
                title: `${message.author.tag} приобрел(а) новую роль из магазина!`,
                description: `**теперь твоя роль сияет как бриллиант.**\n> ${role ? role.toString() : row['roleId']}`,
                author: {
                    "name": "Оппсс, у кого-то свеженькая роль."
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
            } })

    }
}
