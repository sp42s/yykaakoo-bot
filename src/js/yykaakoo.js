import * as Discord from 'discord.js'
import { logger } from './lib/logger'
import config from '../../config/auth.json'
import { findTopScores, findSingleScore } from './commands/raideriocaller'
import { findAllMissingEnchants, buildUrl } from './commands/enchantsnitch'
import { cheerUp } from './commands/random'
import { WowLogs } from './commands'

logger.info(`bot starting ${new Date}`)

const client = new Discord.Client()

client.on('ready', () => {
    logger.info('I am ready!')
})

client.on('message', async message => {
    if (message.content.substring(0, 1) === '§') {
        let reply;
        let simpleCommands = {
            'lumoukset': findAllMissingEnchants,
            'parhaatscoret': findTopScores,
            'score': findSingleScore,
            'kannusta': cheerUp,
            'logs': WowLogs.handleMessage
        }

        let args = message.content.substring(1).trim().split(' ')
        if (!args[0]) return
        logger.info(`received parms ${args}`)
        let command = args[0]
        let params = args.slice(1, args.length)
        logger.info(`command '${command}' from channel ${message.channel.name}, from user ${message.author.username}`)
        let sentMessage = await message.channel.send('Hetki, käsittelen...')
        if (simpleCommands[command]) {
            //args 1 should be a charname, its ok if its missing
            
            try {
                reply = await simpleCommands[command](args.length > 1 ? params : args[1], sentMessage)
            } catch (error) {
                logger.error(error.stack)
                reply = 'Nyt tapahtui ikävä kyllä niin että jokin virhe esti minua vastaamasta kyselyysi 😞'
            }
        } else {
            reply = 'Koitappa jotain näistä: ' + Object.keys(simpleCommands).reduce((s1, s2) => s1 + ', ' + s2)
            logger.info(`no such command '${command}'`)
        }

        if (reply && reply.length > 0) {
            sentMessage.edit(reply)
                .then(msg => console.log(`Sent a reply as ${msg.author}`))
                .catch(console.error)
        }
    }
});

client.login(config.discordBotToken)

let idToMention = (id) => {
    return `<@${id}>`
}