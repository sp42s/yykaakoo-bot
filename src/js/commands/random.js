import { logger } from '../lib/logger'

let cheerUp = (userId) => {
    return new Promise((resolve, reject) => {
        if (userId) resolve(`Olet erittäin hyvä pelaamaan, ${userId}! 🎉🎉`)
        else reject('Kannustaisin mutta ketä? Ootko koskaan aatellut että sun tekos saattaa aiheuttaa jollekin mielipahaa?')
    })
}
    







export { cheerUp }