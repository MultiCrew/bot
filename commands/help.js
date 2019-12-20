const config = require('config');
const prefix = config.get('discord.prefix');
const AsciiTable = require('ascii-table');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '[command name]',
	cooldown: 5,
	execute(message, args) {
		const {commands} = message.client;

		if(!args.length) {
			const table = new AsciiTable('Help Commands');
			table.setHeading('Name', 'Usage')
			commands.map(command => {
				table.addRow(command.name, command.usage);
			})
			return message.channel.send('```' + table.toString() + '```');
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
		
		if (!command) {
			message.reply(`, that's not a valid command`);
		}

		const table = new AsciiTable(command.name)
		table.setHeading('Aliases', 'Description', 'Usage')
			.addRow(command.aliases, command.description, command.usage);
		return message.channel.send('```' + table.toString() + '```');
	}
};