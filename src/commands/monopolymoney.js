import * as axios from 'axios'
import * as prefixes from '../config/prefixes.json'
import * as Promise from 'bluebird'
import logger from '../lib/logger'
import config from '../config/config.json'

const block = '```'

let handlePriceCommand = async (params) => {
    let coin;
    if (!params || !params[0]) {

    } else {
        coin = params.reduce((s1, s2) => `${s1}-${s2}`)
    }

    try {
        if (coin)
            return getPrice(false, coin)
        else
            return getPrice(true, coin)
    } catch (error) {
        console.error(error.stack)
        return `tuut`
    }
}

async function getPrice(all = true, coin) {
    let coinData
    if (all) {
        let count = all ? 5 : 100
        const priceResult = await getPrices(false, count)
        const prices = priceResult.data
        coinData = prices
    } else {
        const priceResult = await getPrices(coin)
        const prices = priceResult.data
        coinData = prices
    }
    let msg = ``
    if (coinData) {
        msg += formatPrices(coinData)
    }
    else {
        msg = `tööt`
    }
    return block + msg + block
}

function formatPrices(coinDataAr) {
    let msg = ``
    console.log(`${JSON.stringify(coinDataAr)}`)
    const nameLengths = coinDataAr.map(coinData => coinData.name ? coinData.name.length : 0)
    const namePad = Math.max(...nameLengths) + 1 < 10 ? 10 : Math.max(...nameLengths) + 1
    const PriceLengths = coinDataAr.map(coinData => coinData.price_usd ? coinData.price_usd.length : 0)
    const pricePad = Math.max(...PriceLengths) + 1
    console.log(`left ${namePad} pad right ${pricePad}`)
    for (const coinData of coinDataAr) {
        console.log(`handling ${coinData}`)
        msg += `${coinData.name.padEnd(namePad)} ${coinData.price_usd.padStart(pricePad)} USD\n`
        msg += `${'Muutos 1h'.padEnd(namePad)} ${coinData.percent_change_1h.padStart(pricePad)} %\n`
        msg += `${'Muutos 24h'.padEnd(namePad)} ${coinData.percent_change_24h.padStart(pricePad)} %\n`
        msg += `${'Muutos 7d'.padEnd(namePad)} ${coinData.percent_change_7d.padStart(pricePad)} %\n\n`
    }
    return msg
}

async function getPrices(coinName, count) {
    try {
        return await axios.get(buildUrl(coinName, count))
    } catch (error) {
        throw error
    }
}


function buildUrl(coinName, count) {
    if (coinName)
        return 'https://api.coinmarketcap.com/v1/ticker/' + coinName
    else
        return 'https://api.coinmarketcap.com/v1/ticker/?limit=' + count
}
export {
    handlePriceCommand
}