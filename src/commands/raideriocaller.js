import * as path from 'path'
import * as axios from 'axios'
import players from '../config/players.json'
import * as prefixes from '../config/prefixes.json'
import * as Promise from 'bluebird'
import * as querystring from 'querystring'
import logger from '../lib/logger'
import config from '../config/config.json'

const scoresField = 'mythic_plus_scores'
const weeklyTopThree = 'mythic_plus_weekly_highest_level_runs'


let handleSingleScoreCommand = async (params) => {
  if (!params || !params[0]) return 'Ketä?'
  const charName = params[0]
  try {
    const result = await findRaiderIoScoreByUser(charName, 0)
    const name = result.data.name
    const score = result.data.mythic_plus_scores.all
    return `${name} ${score}`
  } catch (error) {
    throw error
  }
}

let handleTopScoresCommand = () => {
  return new Promise((resolve, reject) => {
    let axiosPromises = []
    players.forEach((player, i) => {
      logger.info(`fetching ${buildUrl(player, scoresField)}`)
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
      console.log(`message is ${msg}`)
      resolve(msg)
    }).catch(error => {
      console.log(error)
      reject('Jotain meni vikaan, pahoittelen...')
    })
  })
}

let handleWeeklyRunCommand = async (params, messageToEdit) => {
  if (!params || !params[0]) return 'Ketä?'
  let charName = params[0]
  try {
    let result = await weeklyTopByCharname(charName, 0)
    let { name, runs } = result
    let message = weeklyDataToMessage(name, runs)
    return message
  } catch (error) {
    console.log(error)
    throw error
  }
  return
}

let handleMissingMythicsCommand = async (params) => {
  try {
    let result = await fetchRunsForEveryone()
    result = result.filter(player => !player.runs.length || player.runs.length < 1 || player.runs[0].mythic_level < 15)
    result.forEach(console.log)
    result = result.map(player => player.name)
    result.sort()
    let msg = result.reduce((s1, s2) => s1 + '\n' + s2)

    msg = 'Näiltä hahmoilta puuttuu +15 myttynen, aijjai...' + '```\n' + msg.trim() + '\n```'
    return msg
  } catch (error) {
    throw error
  }
}

function fetchRunsForEveryone() {
  return new Promise((resolve, reject) => {
    let playersRuns = []
    let axiosPromises = []
    players.forEach((player, i) => {
      axiosPromises.push(weeklyTopByCharname(player, i))
    })
    Promise.all(axiosPromises).then(results => {
      let playerScores = [];
      for (const result of results) {
        playersRuns.push(result)
      }
      resolve(playersRuns)
    }).catch(error => {
      reject(error)
    })
  }).catch(error => {
    throw error
  })
}

function getPrefix(name, dungeonStrings) {
  let msg = ''
  let badString = `Hahmolla ${name} ei ole viikottaisia runeja`
  switch (dungeonStrings.length) {
    case 0:
      msg = badString
      break;
    case 1:
      msg = `Tässän on sankarin ${name} viikon isoin myty, oi kun se on yksinäinen!! 😳`
      break;
    default:
      msg = `Tässän on sankarin ${name} viikon ${dungeonStrings.length} isointa mytyä, oi kun ne on isoja! 😳`
      break;
  }
  return msg
}
function weeklyDataToMessage(name, runs) {
  let dungeonStrings = runs.map(run => `${run.dungeon} +${run.mythic_level}`)
  let prefix = getPrefix(name, dungeonStrings)
  let block = '```'
  let body = ''
  for (const value of dungeonStrings) {
    body += value + '\n'
  }
  body = body.trim()
  let message
  if (body.length == 0)
    message = prefix
  else
    message = `${prefix}${block}${body}${block}`
  return message
}
function weeklyTopByCharname(charName, delay) {
  return new Promise((resolve, reject) => {
    if (!charName) reject('Ketä?')
    setTimeout(() => {
      let topUrl = buildUrl(charName, weeklyTopThree)
      console.log(topUrl)
      axios.get(topUrl)
        .then(result => {
          let name = result.data.name
          let runs = result.data.mythic_plus_weekly_highest_level_runs
          let data = { name, runs }
          resolve(data)
        }).catch(function (error) {
          console.error(`Error finding weeklytop for url ${topUrl}`)
          let errDesc = ' E'
          if (error.response) errDesc += error.response.status
          else errDesc += '000'
          let name = charName.padEnd(15) + errDesc
          let runs = []
          let data = { name, runs }
          resolve(data)
        })
    }, delay * 50)
  })
}

function findRaiderIoScoreByUser(charName, delay = 0) {
  return new Promise((resolve, reject) => {
    if (!charName) reject('Ketä?')
    setTimeout(() => {
      let scoreUrl = buildUrl(charName, scoresField)
      axios.get(scoreUrl)
        .then(result => {
          resolve(result)
        }).catch(function (error) {
          console.error(`Error finding scorebyuser for url ${scoreUrl}`)
          let errDesc = ' E'
          if (error.response) errDesc += error.response.status
          else errDesc += '000'
          let mockResult = {
            data: {
              name: charName.padEnd(15) + errDesc,
              mythic_plus_scores: {
                all: 0
              }
            }
          }
          resolve(mockResult)
        })
    }, delay * 50)
  })
}

function buildUrl(characterName, fields) {
  return config.raiderIo.url + querystring.stringify(
    {
      region: config.raiderIo.region,
      realm: config.raiderIo.realm,
      name: characterName,
      fields: fields
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

export {
  handleSingleScoreCommand,
  handleTopScoresCommand,
  handleWeeklyRunCommand,
  handleMissingMythicsCommand
}