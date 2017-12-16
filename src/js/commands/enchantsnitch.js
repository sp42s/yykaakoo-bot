import { logger } from '../lib/logger'
const { URL } = require('url');
import auth from '../../../config/auth.json'
import config from '../../../config/config.json'
import * as axios from 'axios'
import * as Promise from 'bluebird'
import { setTimeout } from 'timers';

Promise.longStackTraces();

let findAllMissingEnchants = async (firstParam, chatChannel) => {
    let result
    try {
        result = await axios.get(getGuildDataUrl())
        console.log(`got guild data`)
    } catch (error) {
        console.error('no guild data')
        console.error(error)
    }
    let guildData = result.data.members;
    guildData = guildData.filter(member => member.rank <= 3)
    guildData = guildData.filter(member => member.character.level == 110)

    console.log(`guild data length ${guildData.length}`)
    let enchantData = await fetchEnchantData(guildData)
    enchantData = enchantData.filter(data => data.missingEnchants.length > 0)
    let msg = enchantDataToString(enchantData)
    console.log(`got enchant data`)
    let suffix = 'Muistakaa lumoukset tai muuten! 👮'

    chatChannel.send(msg)
        .then(msg => {
            setTimeout(() => {
                msg.edit(msg.content + suffix)
                    .then(msg => logger.info('edited suffix'))
                    .catch(console.error)
            }, 10000)
        })
        .catch(console.error)
    return
}

function enchantDataToString(enchantData) {
    let shoulders = []
    let prefix = 'Jukranpujut, haluat siis nähdä ketä voisi hyötyä enchanteista?'

    let block = '```'
    let body = ''
    logger.info('formatting enchants ')
    for (const enchant of enchantData) {
        console.log(enchant)
        let name = enchant.name
        let missing = enchant.missingEnchants
        let enchantString = missing.reduce((s1, s2) => s1 + ', ' + s2)
        if (enchantString === 'shoulder')
            shoulders.push(name)
        else
            body += `Ryöväriltä ${name.padEnd(16)} puuttuu nämä: ${enchantString}\n`
    }
    if (shoulders.length > 0)
        body += '\nJa nämä epäonniset ovat ilman olkalumousta:\n' + shoulders.reduce((s1, s2) => s1 + ', ' + s2)
    body = prefix + block + body.trim() + block
    return body
}


console.log(getItemDataUrl('Inath'))

function fetchEnchantData(guildData) {
    let axiosPromises = []
    guildData.forEach((member, i) => {
        setTimeout(() => {
            let memberName = member.character.name
            console.log(`got data for ${memberName}`)
            let axiosPromise = axios.get(getItemDataUrl(memberName))
            axiosPromises.push(axiosPromise)
        }, 10 * i)
    })
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            Promise.all(axiosPromises).then(itemResults => {
                let missingEnchants = []
                for (const itemResult of itemResults) {
                    let itemData = itemResult.data
                    missingEnchants.push(parseAndSendEnchantSnitchMessage(itemData))
                }
                resolve(missingEnchants)
            }).catch(error => {
                console.log(error)
                reject('Jotain meni vikaan, pahoittelen...')
            })
        }, 10 * guildData.length + 250)
    })
}

function parseAndSendEnchantSnitchMessage(itemData) {
    let enchantData = {
        "name": itemData.name,
        "missingEnchants": []

    }
    let items = itemData.items
    if (!items.finger1.tooltipParams.enchant)
        enchantData.missingEnchants.push('finger1')
    if (!items.finger2.tooltipParams.enchant)
        enchantData.missingEnchants.push('finger2')
    if (!items.neck.tooltipParams.enchant)
        enchantData.missingEnchants.push('neck')
    if (!items.back.tooltipParams.enchant)
        enchantData.missingEnchants.push('back')
    if (!items.shoulder.tooltipParams.enchant)
        enchantData.missingEnchants.push('shoulder')
    return enchantData
}


function memberDataToMemberNames(memberData) {
    let members = memberData.members.filter(member => member.rank <= 1)
    let memberNames = members.map(member => member.character.name)
    return members;
}

function getItemDataUrl(characterName) {
    let address = new URL(config.mashery.baseurl)
    address.pathname = `${config.mashery.itempath}/${config.mashery.realm}/${characterName}`
    address.searchParams.append('locale', config.mashery.locale)
    address.searchParams.append('fields', config.mashery.itemfields)
    address.searchParams.append('apikey', auth.masheryKey)

    return address.href
}
function getGuildDataUrl() {
    let address = new URL(config.mashery.baseurl)
    address.pathname = `/${config.mashery.memberspath}/${config.mashery.realm}/${config.mashery.guildname}`
    address.searchParams.append('locale', config.mashery.locale)
    address.searchParams.append('fields', config.mashery.memberfields)
    address.searchParams.append('apikey', auth.masheryKey)

    return address.href
}

function scheduleRequests(axiosInstance, intervalMs) {
    let lastInvocationTime = undefined;

    const scheduler = (config) => {
        const now = Date.now();
        if (lastInvocationTime) {
            lastInvocationTime += intervalMs;
            const waitPeriodForThisRequest = lastInvocationTime - now;
            if (waitPeriodForThisRequest > 0) {
                return new Promise((resolve) => {
                    setTimeout(
                        () => resolve(config),
                        waitPeriodForThisRequest);
                });
            }
        }

        lastInvocationTime = now;
        return config;
    }

    axiosInstance.interceptors.request.use(scheduler);
}

export { findAllMissingEnchants } 