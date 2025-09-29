import axios from 'axios'
import * as cache from '../db/blackboard'
const baseURL = process.env.BLACKBOARD_API_URL
const BB_API_CLIENT_ID = process.env.BLACKBOARD_API_CLIENT_ID
const BB_API_SECRET = process.env.BLACKBOARD_API_SECRET

class BlackBoardApiClient {

  constructor() {
    if (!BlackBoardApiClient.instance) {
      this.client = axios.create({
        baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // Setup authentication
			/*
      this.client.interceptors.request.use((config) => {
        console.log('BlackBoard API Request URL:', config.baseURL + config.url)
        console.log('BlackBoard API Method:', config.method?.toUpperCase())
        console.log('BlackBoard API User configured:', BB_API_CLIENT_ID)
        console.log('BlackBoard API Pass configured:', BB_API_SECRET)
        if (BB_API_CLIENT_ID && BB_API_SECRET) {
          const auth = Buffer.from(`${BB_API_CLIENT_ID}:${BB_API_SECRET}`).toString('base64')
          config.headers.Authorization = `Basic ${auth}`
          console.log('Using Basic Auth for user:', BB_API_CLIENT_ID)
          console.log('Auth header length:', config.headers.Authorization.length)
        } else {
          console.error('❌ NO BLACKBOARD AUTHENTICATION CONFIGURED!')
          console.error('BB_API_CLIENT_ID:', BB_API_CLIENT_ID)
          console.error('BB_API_SECRET:', !!BB_API_SECRET ? 'SET' : 'NOT SET')
        }
        return config
      })
				*/
      
      // Interceptor para logging
      this.client.interceptors.request.use(
        async (config) => {
          console.log(
            'interceptors.request.use => Authorization',
            config?.headers?.Authorization
          )
          console.log(
            'interceptors.request.use => config',
            config,
          )
          const isAuthReq = config.headers?.Authorization?.includes('Basic')

          if (!isAuthReq) {
            const token = await this.getToken()
            console.log('interceptors.request.use => token => ', token)
            config.headers.Authorization = `Bearer ${token}`
          }

          console.log('BLACKBOARD API Request:', {
            url: config.url,
            method: config.method,
            data: config.data,
            params: config.params
          });
          return config
        },
        (error) => {
          console.error('BLACKBOARD API Request Error:', error)
          return Promise.reject(error); // Propagate the error if not retried
        }
      )
      
      this.client.interceptors.response.use(
        (response) => {
          console.log('BLACKBOARD API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
          })
          return response
        },
        async (error) => {
          console.log('before handleResponseError', error)
          return await this.handleResponseError(error)
        }
      )
      BlackBoardApiClient.instance = this
    }
  }

  async handleResponseError (error) {
    console.log('handleResponseError')
    const originalRequest = error.config;
    originalRequest._retryCount = originalRequest._retryCount || 0;

    const isAuthReq = originalRequest
      .headers?.Authorization?.includes('Basic')

    if (error.response.status == 401) {
      if (isAuthReq) {
        this.notifyResponseError(error, 'BLACKBOARD API - FAILED AUTHENTICATION: ')
        return Promise.reject(error);
      }

      this.notifyResponseError(error,'request error 401 => getting new token')
      if (originalRequest._retryCount < 3) {
        originalRequest._retryCount += 1;
        console.log('handleResponseError => Retrying request', originalRequest._retryCount)
        const token = await this.getNewToken()
        originalRequest.headers.Authorization =
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
        originalRequest.headers['Authorization'] = `Bearer ${token}`
        console.log('handleResponseError => Retrying request => new token', `Bearer ${token}`)
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.client(originalRequest)
        //return axios(originalRequest); // Re-send the request
      }
    }

    this.notifyResponseError(error, 'BLACKBOARD API Unknown Response Error: ')
    return Promise.reject(error); // Propagate the error if not retried
  }

  notifyResponseError (error, message = '') {
    console.error(message, {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data
    })
  }

  /* get token from cache or blackboard */
  async getToken() {
		// obtener token de cache
	  const oldToken = await cache.getToken();
    console.log('getToken => oldToken => ', oldToken)
    if (!!oldToken) return oldToken
    const newToken = await this.getNewToken()
		console.log('getToken => newToken => ', newToken)
    return newToken
  }


  // Al interceptar cada request:
  // obtengo token desde cache
  // si no hay token en cache
    // obtengo nuevo token
    // guardo el token
  // procedo con la request
  
  // Al interceptar Error:
  // si el error es por expired token
    // obtengo nuevo token
    // guardo el token
  // si no
    // retorno el error

  /* Asks blackboard for new token  */
  async getNewToken () {
    try {
      console.log('getNewToken => try => ')
			const auth = Buffer.from(`${BB_API_CLIENT_ID}:${BB_API_SECRET}`).toString('base64')
      console.log('getNewToken => try => auth => ', auth)

			const request = await this.client.post(
        '/v1/oauth2/token?grant_type=client_credentials',{},
        {	headers: { 
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }}
      )
      //console.log('getNewToken => request', request)
			const {access_token: token} = request.data
      console.log('getNewToken => request.status', request.status)
      console.log('getNewToken => request', request)

			console.log('getNewToken => token', token)
      await cache.saveToken(token)
			return token
    } catch (e) {
			console.log('Error getNewToken', e)
      return null
    }
  }

  getClient() {
    return this.client
  }
}

export default new BlackBoardApiClient()