import * as winston from 'winston'

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});   
logger.remove(winston.transports.Console);
logger.add(new winston.transports.Console({
    format: winston.format.simple()
}));
logger.level = 'debug';

export { logger }