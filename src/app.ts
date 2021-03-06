import express, { Express } from 'express'

import { TorrentClient } from './torrent'
import { setupStreamApi } from './api/stream'
import { setupTorrentsApi } from './api/torrents'
import { readConfig, Config } from './config'
import { setupAppLogger, createLogger } from './logging'
import { setupDemoPage } from './api/demo'

function createApp(config: Config): Express {
    const app = express()
    app.use(express.json())
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next()
    })
    return setupAppLogger(app, config)
}

export async function setup(): Promise<void> {
    const config = await readConfig(process.argv[2])
    const logger = createLogger(config)

    logger.info('Starting app')

    const app = createApp(config)
    const client = await TorrentClient.create(config, logger)
    
    app.get('/status', (req, res) => res.send({'status': 'ok'}))

    setupDemoPage(app, config, logger)
    setupTorrentsApi(app, config, logger, client)
    setupStreamApi(app, config, logger, client)

    app.listen(config.port)
}

