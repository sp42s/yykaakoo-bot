
import * as Discord from 'discord.js'
import { logger } from './lib/logger'
import auth from '../../config/auth.json'
import { findTopScores, findRaiderIoScoreByUser } from './commands/raideriocaller'
import { findAllMissingEnchants } from './commands/enchantsnitch'


logger.info(`bot startings ${new Date}`)
// Initialize Discord Bot
const client = new Discord.Client()

client.on('ready', () => {
    console.log('I am ready!')
})

client.on('message', async message => {
    if (message.content.substring(0, 4) === '!123') {
        let reply = '';


        let args = message.content.substring(4).trim().split(' ')
        logger.info(message.content)
        if (!args[0]) return
        let command = args[0]
        logger.info(`command is ${args[0]}`)
        switch (command) {
            case 'score':
                try {
                    if (args[1]) {
                        logger.info(`score command is ${args[1]}`)
                        reply = await findRaiderIoScoreByUser(args[1])
                    } else
                        reply = 'Miksi teit sen?'
                } catch (error) {
                    reply = error;
                }
                break;
            case 'lumoukset':
                reply = await findAllMissingEnchants()
                break;
            case 'parhaatscoret':
                reply = await findTopScores()
                break;
            case 'autamundepsiä':
                reply = "hanki aman'thul's vision"
                break;
            case 'haloo':
                reply = 'no haloo'
                break;
            case 'hitto':
                reply = `+hemmetti`
                break;

            default:
                reply = `Mitä sinä sano?`
        }


        message.reply(reply)
    }
});

client.login(auth.discordBotToken)

let idToMention = (id) => {
    return `<@${id}>`
}