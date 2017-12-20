import * as Discord from 'discord.js'
import { logger } from './lib/logger'
import config from '../../config/auth.json'
import {
    handleTopScoresCommand,
    handleSingleScoreCommand,
    handleWeeklyRunCommand,
    handleMissingMythicsCommand
} from './commands/raideriocaller'
import { findAllMissingEnchants, buildUrl } from './commands/enchantsnitch'
import { handleCurrentWeatherCommand } from './commands/weather'
import { cheerUp } from './commands/random'
import { WowLogs } from './commands'

logger.info(`bot starting ${new Date}`)

const client = new Discord.Client()

client.on('ready', () => {
    logger.info('I am ready!')
})

client.on('message', async message => {
    if (message.content.indexOf('😭') > -1) {
        try { await message.react('😭') } catch (e) { console.error(e) }
        //try {await message.channel.send(`Viestejä olipi ${message.channel.messages.length}`)} catch (e) {console.error(e)}

    }
    if (message.content.substring(0, 1) === '§') {
        let reply;
        let simpleCommands = {
            'lumoukset': findAllMissingEnchants,
            'parhaatscoret': handleTopScoresCommand,
            'score': handleSingleScoreCommand,
            'kannusta': cheerUp,
            'logs': WowLogs.handleMessage,
            'viikonmytyt': handleWeeklyRunCommand,
            'onnettomat': handleMissingMythicsCommand,
            'sää': handleCurrentWeatherCommand
        }

        let args = message.content.substring(1).trim().split(' ')
        if (!args[0]) return
        logger.info(`received parms ${args}`)
        let command = args[0]
        let params = args.slice(1, args.length)
        logger.info(`command '${command}' from channel ${message.channel.name}, from user ${message.author.username}`)
        let sentMessage = await message.channel.send('Hetki, käsittelen...')
        if (simpleCommands[command]) {
            try {
                reply = await simpleCommands[command](params, sentMessage)
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
                .then(msg => console.log(`end of yykaakoo sent a reply of [${msg.content}]`))
                .catch(console.error)
        }
    }
});

client.login(config.discordBotToken)

let idToMention = (id) => {
    return `<@${id}>`
}