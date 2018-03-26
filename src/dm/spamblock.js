import logger from '../lib/logger'
import * as Promise from 'bluebird'
import config from '../config/config.json'
import auth from '../config/auth.json'
import * as axios from 'axios'
import moment from 'moment'
const maxMessageCount = 3
const messageResetTime = 60
const { URL } = require('url');

const messageHistories = []

let handleDm = async (client, message) => {
  const sender = message.author.id
  const sendMessage = async (msg) => { try { await message.channel.send(msg) } catch (e) { throw e } }

  var foundIx = messageHistories.findIndex(messageHistory => messageHistory.id === sender)

  if (foundIx !== -1) {
    let firstSendTime = messageHistories[foundIx].sendTime
    if ((moment().unix() - firstSendTime) > messageResetTime) {
      messageHistories[foundIx].sendTime = moment().unix()
      messageHistories[foundIx].messageCount = 0
    }

    let resetsIn = messageResetTime - (moment().unix() - firstSendTime)
    let resetTime = moment((moment().unix() + resetsIn) * 1000).format("HH:mm:ss")
    let messagesRemaining = maxMessageCount - messageHistories[foundIx].messageCount
    if (messagesRemaining === 0) {
      sendMessage(`Pahoittelut mutta olet saavuttanut suurimman sallitun viestimäärän, viestirajoitus poistuu klo: ${resetTime}.`).catch(console.error)
    } else {
      let msgString = ''
      messageHistories[foundIx].messageCount = messageHistories[foundIx].messageCount + 1
      messagesRemaining = maxMessageCount - messageHistories[foundIx].messageCount

      if (messagesRemaining === 1)
        msgString = `${messagesRemaining} viesti käytettävissä`
      else if (messagesRemaining === 0)
        msgString = `ei viestejä käytettävissä, viestirajoitus poistuu klo: ${resetTime}`
      else
        msgString = `${messagesRemaining} viestiä käytettävissä`
      sendMessage(`Kiitos viestistä, se on ohjattu eteenpäin,  ${msgString}.`).catch(console.error)
    }
  } else {
    messageHistories.push({ id: sender, messageCount: 1, sendTime: moment().unix() })
    sendMessage(`Kiitos viestistä, se on ohjattu eteenpäin, ${maxMessageCount - 1} viestiä käytettävissä.`).catch(console.error)
  }
}

export { handleDm }