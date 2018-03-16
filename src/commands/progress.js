import axios from 'axios'
import jsdom from 'jsdom'

const { JSDOM } = jsdom;

const progress = {
    getWowProgress: async (guild = 'ryöstöretki', realm = 'darksorrow', region = 'eu') => {
        const url = encodeURI(`https://www.wowprogress.com/guild/${region}/${realm}/${guild}`)
        try {
            const result = await axios.get(`${url}/json_rank`)
            const result2 = await axios.get(url)
            const dom = new JSDOM(result2.data)
            const proge = dom.window.document.querySelector('.ratingProgress').querySelector('b').innerHTML
            let response = {
                embed: {
                    color: 3447003,
                    title: `${guild.charAt(0).toUpperCase()}${guild.slice(1)} ${realm.charAt(0).toUpperCase()}${realm.slice(1)}-${region.toUpperCase()} progress`,
                    url,
                    description: '',
                    fields: [
                        {
                            name: 'Progress',
                            value: proge
                        },
                        {
                            name: 'Realm rank:',
                            value: result.data.realm_rank
                        },
                        {
                            name: 'World rank:',
                            value: result.data.world_rank
                        },
                        {
                            name: 'Score',
                            value: result.data.score
                        }
                    ],
                    footer: {
                        text: '© Rösörbot'
                    }
                }
            }
            return response
        } catch (err) {
            throw Error('Error in getWowProgress: ', err)
        }
    },
    handleMessage: async (params) => {
        try {
            const wowProgress = await progress.getWowProgress(params[0], params[1], params[2])
            return wowProgress
        } catch (err) {
            console.log('error in handleMessage:', err)
            return 'Tapahtui virhe'
        }
    }
}

console.log("Asdasd")
export default progress