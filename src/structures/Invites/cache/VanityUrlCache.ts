enum GuildFeature {
	VANITY_URL = 'VANITY_URL',
}
import { Cache } from './Cache'
export class VanityUrlCache extends Cache<string> {
	public async init() {
		// NO-OP
	}

	protected async _get(guildId: string): Promise<string> {
		const guild = this.core.guilds.cache.get(guildId);
		if (!guild || !guild.features.includes(GuildFeature.VANITY_URL)) {
			return '';
		}

		return (
			guild
				.fetchVanityCode()
				.catch(() => '')
		);
	}
}
