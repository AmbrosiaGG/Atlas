const Discord = require("discord.js");

/* THIS CHECK IF THERE IS A USER TO UNMUTE */

module.exports = {
    
	/**
     * Starts checking...
     * @param {object} client The Discord Client instance
     */
	async init(client) {
		// Load muted users into the cache
		client.membersData.find({ "mute.muted": true }).then((members) => {
			members.forEach((member) => {
				client.databaseCache.mutedUsers.set(`${member.id}${member.guildID}`, member);
			});
		});

		// Check every second for users that need to be unmuted
		setInterval(async () => {
			// Convert the muted users Map into an array of values
			[...client.databaseCache.mutedUsers.values()]
				.filter((m) => m.mute.endDate <= Date.now()) // Filter muted users whose endDate has passed
				.forEach(async (memberData) => {
					const guild = client.guilds.cache.get(memberData.guildID);
					if (!guild) return;

					// Fetch the member from the guild
					const member = guild.members.cache.get(memberData.id) || await guild.members.fetch(memberData.id).catch(() => {
						// If member is not found, mark them as unmuted in the database
						memberData.mute = {
							muted: false,
							endDate: null,
							case: null
						};
						memberData.save();
						client.logger.log("[unmute] " + memberData.id + " cannot be found.");
						return null;
					});

					// Retrieve guild data for further actions
					const guildData = await client.findOrCreateGuild({ id: guild.id });
					guild.data = guildData;

					// If the member is found, remove their mute-related permission overwrites
					if (member) {
						guild.channels.cache.forEach((channel) => {
							const permOverwrites = channel.permissionOverwrites.get(member.id);
							if (permOverwrites) permOverwrites.delete();
						});
					}

					// Send a notification to the mod logs channel
					const user = member ? member.user : await client.users.fetch(memberData.id);
					const embed = new Discord.MessageEmbed()
						.setDescription(guild.translate("moderation/unmute:SUCCESS_CASE", {
							user: user.toString(),
							usertag: user.tag,
							count: memberData.mute.case
						}))
						.setColor("#f44271")
						.setFooter(guild.client.config.embed.footer);

					const channel = guild.channels.cache.get(guildData.plugins.modlogs);
					if (channel) {
						channel.send({ embeds: [embed] });
					}

					// Update the member's mute data in the database and cache
					memberData.mute = {
						muted: false,
						endDate: null,
						case: null
					};
					client.databaseCache.mutedUsers.delete(`${memberData.id}${memberData.guildID}`);
					await memberData.save();
				});
		}, 1000); // Check every second
	}
};
