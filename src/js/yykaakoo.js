import * as Discord from 'discord.js'
import { logger } from './lib/logger'
import auth from '../../config/auth.json'
import { findTopScores, findRaiderIoScoreByUser } from './commands/raideriocaller'
import { findAllMissingEnchants, buildUrl } from './commands/enchantsnitch'
import { cheerUp } from './commands/random'

logger.info(`bot starting ${new Date}`)

const client = new Discord.Client()

client.on('ready', () => {
    logger.info('I am ready!')
})

client.on('message', async message => {
    if (message.content.substring(0, 4) === '!123') {
        let reply;
        let simpleCommands = {
            'lumoukset': findAllMissingEnchants,
            'parhaatscoret': findTopScores,
            'score': findRaiderIoScoreByUser,
            'kannusta': cheerUp
        }

        let args = message.content.substring(4).trim().split(' ')
        if (!args[0]) return
        let command = args[0]
        logger.info(`command '${command}' from channel ${message.channel.name}, from user ${message.author.username}`)


        if (simpleCommands[command]) {
            //args 1 should be a charname, its ok if its missing
            try {
                reply = await simpleCommands[command](args[1], message.channel)
            } catch (error) {
                reply = error
            }
        } else {
            reply = 'Koitappa jotain näistä: ' + Object.keys(simpleCommands).reduce((s1, s2) => s1 + ', ' + s2)
            logger.info(`no such command '${command}'`)
        }

        if (reply && reply.length > 0) {
            message.channel.send(reply)
                .then(msg => console.log(`Sent a reply as ${msg.author}`))
                .catch(console.error)
        }
    }
});

client.login(auth.discordBotToken)

let idToMention = (id) => {
    return `<@${id}>`
}