import { Message } from 'discord.js'
import { invs } from '../../main'

import Command, { CommandParams } from '../../structures/Command'
import { resolveMember } from '../../utils/util'

export default class extends Command {
    get options() {
        return { name: 'invites' }
    }

    async execute(message: Message, args: string[], { member, guild }: CommandParams) {
        const target = (await resolveMember(args[0])) || member
        const invite = await invs.getInviteCounts(guild.id, target.id);
        return message.channel.send({
            embed: {
                title:`For whom: ${target.user.username}`,
                description: [`total:**${invite.total}**`,
                    `regular:**${invite.regular}**`,
                    `fake:**${invite.fake}**`,
                    `leave:**${invite.leave}**`].join('\n')
            }
        });
    }
}
