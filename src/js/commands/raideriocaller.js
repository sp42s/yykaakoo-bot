import * as path from 'path'
import * as axios from 'axios'
import * as players from '../../../config/players.json'
import * as prefixes from '../../../config/prefixes.json'
import * as querystring from 'querystring'
import * as Promise from 'bluebird'
import { logger } from '../lib/logger'
import config from '../../../config/config.json'

let findRaiderIoScoreByUser = (userId) => {
  // userId = encodeURIComponent(userId)
  logger.info(buildUrl(userId))
  return new Promise((resolve, reject) => {
    axios.get(buildUrl(userId))
      .then(result => {
        let charName = result.data.name
        let score = result.data.mythic_plus_scores.all
        resolve(`${charName} ${score}`)
      }).catch(function (error) {
        console.log('vittu')
        reject('Emmatiia mita sa haluut multa')
      })
  })
}


let findTopScores = () => {
  return new Promise((resolve, reject) => {
    let axiosPromises = []
    players.forEach((player, i) => {
      setTimeout(function () {
        logger.info(`fetching ${buildUrl(player)}`)
        let axiosPromise = axios.get(buildUrl(player))
        axiosPromises.push(axiosPromise)
      }, 100 * i)
    });
    logger.info(`promisecount ${axiosPromises.length}`)
    setTimeout(function () {
      Promise.all(axiosPromises).then(results => {
        let playerScores = [];
        for (const result of results) {
          let name = result.data.name
          let score = result.data.mythic_plus_scores.all
          playerScores.push({name, score})
        }
        playerScores.sort(compareScoreDescending)
        let msg = generateTopPlayerScoreMessage(playerScores, 5)
        console.log(msg)
        resolve(msg)
      }).catch(error => {
        console.log(error)
        reject('Jotain meni vikaan, pahoittelen...')
      })
    }, players.length * 120)
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
    topList += `${i+1}: ${playerScores[i].name}: ${playerScores[i].score}\n`
  }
  topList = topList.trim()
  let msg = `${prefixMsg}${boxEdge}${topList}${boxEdge}${suffixMsg}`
  return msg
}

function compareScoreDescending(playerData1, playerData2){
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

export { findRaiderIoScoreByUser, findTopScores }