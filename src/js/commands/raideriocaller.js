import * as path from 'path'
import * as axios from 'axios'
import * as players from '../../../config/players.json'
import * as prefixes from '../../../config/prefixes.json'
import * as querystring from 'querystring'
import * as Promise from 'bluebird'
import { logger } from '../lib/logger'
import config from '../../../config/config.json'

let findRaiderIoScoreByUser = (userId, delay = 0) => {
  return new Promise((resolve, reject) => {
    if (!userId) reject('Kuka?')
    setTimeout(() => {
      axios.get(buildUrl(userId))
        .then(result => {
          let charName = result.data.name
          let score = result.data.mythic_plus_scores.all
          resolve(result)
        }).catch(function (error) {
          reject('Tais ol joku olematon nimi, miksi kiusit 😭')
        })
    }, delay * 15)
  })
}

let findSingleScore = async (userId) => {
  try {
    let result = await findRaiderIoScoreByUser(userId, 0)
    let name = result.data.name
    let score = result.data.mythic_plus_scores.all
    return `${name} ${score}`
  } catch (error) {
    return error
  }
}

let findTopScores = () => {
  return new Promise((resolve, reject) => {
    let axiosPromises = []
    players.forEach((player, i) => {
      logger.info(`fetching ${buildUrl(player)}`)
      let axiosPromise = findRaiderIoScoreByUser(player, i)
      axiosPromises.push(axiosPromise)
    });
    logger.info(`promisecount ${axiosPromises.length}`)
    Promise.all(axiosPromises).then(results => {
      let playerScores = [];
      for (const result of results) {
        let name = result.data.name
        let score = result.data.mythic_plus_scores.all
        playerScores.push({ name, score })
      }
      playerScores.sort(compareScoreDescending)
      let msg = generateTopPlayerScoreMessage(playerScores, 5)
      console.log(`message is${msg}`)
      resolve(msg)
    }).catch(error => {
      console.log(error)
      reject('Jotain meni vikaan, pahoittelen...')
    })
  })
}


function buildUrl(characterName) {
  return config.raiderIo.url + querystring.stringify(
    {
      region: config.raiderIo.region,
      realm: config.raiderIo.realm,
      name: characterName,
      fields: config.raiderIo.fields
    })
}

function generateTopPlayerScoreMessage(playerScores, topCount) {
  let prefixMsg = `Haloo ykskakskol joku pyysi Raider.io scorei`
  let suffixMsg = `Erinomaista työtä kaikilta!`
  let boxEdge = "```"
  let topList = ''
  for (let i = 0; i < topCount && i < playerScores.length; i++) {
    topList += `${i + 1}: ${playerScores[i].name}: ${playerScores[i].score}\n`
  }
  topList = topList.trim()
  let msg = `${prefixMsg}${boxEdge}${topList}${boxEdge}${suffixMsg}`
  return msg
}

function compareScoreDescending(playerData1, playerData2) {
  let a = playerData2.score
  let b = playerData1.score
  let comparison = 0

  if (a > b) {
    comparison = 1
  } else if (b > a) {
    comparison = -1
  }

  return comparison
}

export { findSingleScore, findTopScores }