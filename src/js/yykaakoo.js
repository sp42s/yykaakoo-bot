
import * as Discord from 'discord.js'
import { logger } from './lib/logger'
import auth from '../../config/auth.json'
import { findTopScores, findRaiderIoScoreByUser } from './commands/raideriocaller'
import { findAllMissingEnchants } from './commands/enchantsnitch'
import { cheerUp } from './commands/random'


logger.info(`bot startings ${new Date}`)
// Initialize Discord Bot
const client = new Discord.Client()

client.on('ready', () => {
    logger.info('I am ready!')
})

client.on('message', async message => {
    if (message.content.substring(0, 4) === '!123') {
        let reply;
        let commands = {
            'lumoukset': findAllMissingEnchants,
            'parhaatscoret': findTopScores,
            'score': findRaiderIoScoreByUser,
            'kannusta': cheerUp
        }

        let args = message.content.substring(4).trim().split(' ')
        if (!args[0]) return
        let command = args[0]
        logger.info(`command '${command}' from channel ${message.channel.name}, from user ${message.author.username}`)
        logger.info(message.content)
        logger.info(``)

        if (commands[command]) {
            //args 1 should be a charname, its ok if its missing
            try {
                reply = await commands[command](args[1])
            } catch (error) {
                reply = error
            }
        } else {
            logger.info(`no such command '${command}'`)
            return
        }

        message.channel.send(reply)
        .then(msg => console.log(`Sent a reply as ${msg.author}`))
        .catch(console.error)
    }
});

client.login(auth.discordBotToken)

let idToMention = (id) => {
    return `<@${id}>`
}