const { Command } = require('discord-akairo');
const { Discord, MessageEmbed, MessageAttachment } = require('discord.js');

class AnnounceCommand extends Command {
	constructor() {
		super('announce', {
			aliases: ['announce'],
			typing: true,
			args: [
				{
					id: 'title',
					type: 'string',
					prompt: {
						start: 'Enter the title for your announcement, type `cancel` at any time to cancel the announcement',
						cancel: 'Command has been cancelled.',
					}
				},
				{
					id: 'content',
					type: 'string',
					prompt: {
						start: 'Enter the content of your announcement',
						cancel: 'Command has been cancelled.',
					}
				},
				{
					id: 'image',
					type: 'url',
					prompt: {
						start: 'Enter an image url to be attached to the embed. Enter `skip` if you would not like to attach one',
						optional: true
					}
				},
				{
					id: 'channel',
					type: 'channel',
					prompt: {
						start: 'Mention the channel you would like to send the announcement to',
						retry: 'That is not a valid channel, please try again',
						cancel: 'Command has been cancelled.',
					}
				}
			]
		});
	}

	userPermissions(message) {
		if (!message.member.roles.cache.some(role => role.name === 'Admin')) {
			return 'Admin';
		}

		return null;
	}

	exec(message, args) {
		const attachment = new MessageAttachment('./assets/icon.png', 'icon.png');
		const embed = new MessageEmbed()
			.setColor('FF550B')
			.setTitle(args.title)
			.setDescription(args.content)
			.attachFiles(attachment)
			.setThumbnail('attachment://icon.png');
		
		const channel = this.client.channels.cache.get(args.channel.id);
		channel.send(embed);
	}
}

module.exports = AnnounceCommand;