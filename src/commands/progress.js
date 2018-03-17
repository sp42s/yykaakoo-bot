import axios from 'axios'

const progress = {
    getProgress: async (guild = 'ryöstöretki', realm = 'darksorrow', region = 'eu') => {
        const wowProgressUrl = encodeURI(`https://www.wowprogress.com/guild/${region}/${realm}/${guild}`)
        const raiderIoUrl = encodeURI(`https://raider.io/api/v1/guilds/profile?region=${region}&realm=${realm}&name=${guild}&fields=raid_progression,raid_rankings`)
        try {
            const result = await axios.get(raiderIoUrl)
            const result2 = await axios.get(`${wowProgressUrl}/json_rank`)
            const raidName = 'antorus-the-burning-throne'
            const rank = result.data.raid_rankings[Object.keys(result.data.raid_rankings)[Object.keys(result.data.raid_rankings).length - 1]]
            const proge = result.data.raid_progression[`${raidName}`].summary
            const score = result2.data.score
            let response = {
                embed: {
                    color: 3447003,
                    title: `${guild.charAt(0).toUpperCase()}${guild.slice(1)} ${realm.charAt(0).toUpperCase()}${realm.slice(1)}-${region.toUpperCase()} progress`,
                    url: wowProgressUrl,
                    description: '',
                    fields: [
                        {
                            name: `Antorus, the Burning Throne progress:`,
                            value: proge
                        },
                        {
                            name: 'Realm rank:',
                            value: rank.mythic.realm
                        },
                        {
                            name: 'World rank:',
                            value: rank.mythic.world
                        },
                        {
                            name: 'WowProgress score:',
                            value: score
                        }
                    ]
                }
            }
            return response
        } catch (err) {
            throw Error('Error in getProgress: ', err)
        }
    },
    handleMessage: async (params) => {
        try {
            const wowProgress = await progress.getProgress(params[0], params[1], params[2])
            return wowProgress
        } catch (err) {
            console.log('error in handleMessage:', err)
            return 'Tapahtui virhe'
        }
    }
}

export default progress