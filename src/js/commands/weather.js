import { logger } from '../lib/logger'
import * as Promise from 'bluebird'
import config from '../../../config/config.json'
import auth from '../../../config/auth.json'
import * as axios from 'axios'
const { URL } = require('url');

let handleCurrentWeatherCommand = async (params) => {
    if (!params || !params[0]) return 'Missä?'
    let city = params.reduce((s1, s2) => `${s1} ${s2}`)
    logger.info(`getting weather for city [${city}]`)
    let weatherUrl = getWeatherDataUrl(city)
    logger.info(weatherUrl)
    let data = {}
    try {
        let result = await axios.get(weatherUrl)
        data = result.data
    } catch (error) {
        let errDesc = ' E'
        if (error.response && error.response.status == 404)
            errDesc = 'En löytänyt kyseistä kaupunkia 😢'
        else
            console.error(error.stack)
        return errDesc
    }
    let weathers = data.weather.map(w => w.description).map(capitalize)
    weathers = weathers.reduce((s1, s2) => `${s1}, ${s2}`)
    let block = '```'
    let msg = `${block}Sää kaupungissa ${capitalize(city)} on: ${weathers}`
    msg += `\nja lämpötila on ${data.main.temp}°C${block}`
    return msg
}



function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getWeatherDataUrl(city) {
    let address = new URL(config.weather.baseurl)
    address.searchParams.append('q', city)
    address.searchParams.append('appid', auth.openweathermapKey)
    address.searchParams.append('lang', 'fi')
    address.searchParams.append('units', 'metric')
    return address.href
}


export { handleCurrentWeatherCommand }