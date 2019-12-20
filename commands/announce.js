module.exports = {
    name:'announce',
    disabled: true,
    roles: ['admin', 'mod'],
    execute(message, args) {
        var channel = 0;
        var parsedContent = message.content.split(' ').slice(2).join(' ')
        switch (args[0]) {
            case 'announcements':
                channel = message.client.channels.get('645738500360241172');
                break;
            case 'rules':
                channel = message.client.channels.get('440545668600168449');
                break;
            default:
                return message.reply('you must specify either `announcements` or `rules` as the first argument in the message.');
        }
        channel.send(parsedContent + '\n\n@everyone');
    }
}