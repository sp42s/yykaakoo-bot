
import axios from 'axios'
import moment from 'moment'
import warcraftlogsKey from '../../../config/auth'

export default class WowLogs {
    static async handleMessage(params) {
        if(params[0] === 'help') return 'Voit lisätä komennon perään parametrejä esim: guild=ryöstöretki realm=darksorrow region=eu'
        let latestRaid = await WowLogs.getLatestRaid(params)
        let msg = `Viimeisin raidi "${latestRaid.title}" (${moment(latestRaid.start).locale('fi').format('LT')}-${moment(latestRaid.end).locale('fi').format('LT')} ${moment(latestRaid.start).locale('fi').format('L')}) löytyy osoitteesta: https://www.warcraftlogs.com/reports/${latestRaid.id}`
        return msg
    }

    static parseParams(params) {
        let parsedParams = params.map(param => {
            let p = [
                param.split("=")[0],
                param.split("=")[1]
            ]
            return p;
        }).reduce(function(prev,curr) {
            prev[curr[0]] = curr[1]
            return prev
        },{})
        return parsedParams
    }

	static getLatestRaid(params) {
		return new Promise((resolve, reject) => {
            let query
            if (params.length > 0) {
                query = WowLogs.parseParams(params);
                if (!query.realm) query.realm ='darksorrow'
                if (!query.region) query.region = 'eu'
			}
			else {
                query = {
                    guild: 'ryöstöretki',
                    realm: 'darksorrow',
                    region:  'EU'
                }
            }
            if (query.guild && query.realm && query.region) {
                axios.get(`https://www.warcraftlogs.com:443/v1/reports/guild/${encodeURIComponent(query.guild)}/${query.realm}/${query.region}?api_key=${warcraftlogsKey}`)
                    .then( (res) => {
                        let latestRaid = res.data.reduce((prev, curr) => {
                            return ((prev.end > curr.end)) ? prev : curr
                        })
                        resolve(latestRaid)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            } else {
                reject("getLatestRaid: invalid query")
            }
		});
	}
}
