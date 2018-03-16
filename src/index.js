//@ts-check
import { Client } from 'discord.js'
import logger from './lib/logger'
import auth from './config/auth.json'
import config from './config/config.json'
import { 
    handleTopScoresCommand,
    handleSingleScoreCommand,
    handleWeeklyRunCommand,
    handleMissingMythicsCommand
} from './commands/raideriocaller'
import { findAllMissingEnchants } from './commands/enchantsnitch'
import { handleCurrentWeatherCommand } from './commands/weather'
import { handlePriceCommand } from './commands/monopolymoney'
import { cheerUp, mock } from './commands/random'
import { WowLogs } from './commands'

logger.info(`bot starting ${new Date}`)
const client = new Client()

client.on('ready', () => {
    logger.info('I am ready!')
})
let idToMention = (id) => {
    return `<@${id}>`
}

client.on('message', async message => {
    if (message.channel.type === 'dm') {


        
        client.channels.find('id', config.dm.publishChannel).send(`${idToMention(message.author.id)} kuiskasi minulle "${message.content}"`)
    }
    if (message.content.indexOf('😭') > -1) {
        try { await message.react('😭') } catch (e) { console.error(e) }

    }
    if (message.content.substring(0, 1) === '§') {
        let reply;
        let simpleCommands = {
            'lumoukset': findAllMissingEnchants,
            'parhaatscoret': handleTopScoresCommand,
            'score': handleSingleScoreCommand,
            'kannusta': cheerUp,
            'hauku': mock,
            'logs': WowLogs.handleMessage,
            'viikonmytyt': handleWeeklyRunCommand,
            'onnettomat': handleMissingMythicsCommand,
            'sää': handleCurrentWeatherCommand,
            'hinta': handlePriceCommand
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
                reply = await simpleCommands[command](params, sentMessage, message)
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

client.login(auth.discordBotToken)

