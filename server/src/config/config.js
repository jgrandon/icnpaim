import _ from 'lodash'
import configJson from '../../config/config.json'
import * as fs from 'fs'

/**
 * Load the customized config values from the config.json data.
 *
 */

let overrides = ''

let configResult = {}
if (fs.existsSync('server/config/config_override.json')) {
    overrides = require('../../config/config_override.json')
    configResult = _.defaultsDeep(overrides, configJson)
}

if (process.env.APP_URL) {
    configResult['frontend_url'] = process.env.APP_URL //process.env.LTI_TEST_PROVIDER_DOMAIN;
}
if (process.env.LTI_TEST_PROVIDER_PORT) {
    configResult['provider_port'] = process.env.LTI_TEST_PROVIDER_PORT
}
if (process.env.PORT) {
    configResult['provider_port'] = process.env.PORT
}
if (process.env.DATABASE_DIRECTORY) {
    configResult['database_directory'] = process.env.DATABASE_DIRECTORY
}

// Asegurar que el directorio de base de datos termine con /
if (configResult['database_directory'] && !configResult['database_directory'].endsWith('/')) {
    configResult['database_directory'] += '/'
}

export default _.defaultsDeep(configResult, configJson)
