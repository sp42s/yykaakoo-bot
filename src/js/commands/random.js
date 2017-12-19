import { logger } from '../lib/logger'

let cheerUp = (userId) => {
    return new Promise((resolve, reject) => {
        if (userId && userId[0]) resolve(`Olet erittäin hieno ihminen, ${userId[0]}! 🎉🎉`)
        else reject('Kannustaisin mutta ketä? Ootko koskaan aatellut että sun tekos saattaa aiheuttaa jollekin mielipahaa?')
    })
}
    







export { cheerUp }