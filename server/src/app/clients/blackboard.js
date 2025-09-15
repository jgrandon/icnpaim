import axios from 'axios'

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
        (config) => {
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
          return Promise.reject(error)
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
        (error) => {
					if (401 == error.response?.status) {
						this.notifyResponseError(error, 'error 401 => should retry authenticate: ')
					}
					this.notifyResponseError(error, 'BLACKBOARD API Response Error: ')
					return Promise.reject(error)
        }
      )
      BlackBoardApiClient.instance = this
    }
  }

  notifyResponseError (error, message = '') {
    console.error(message, {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data
    })
  }

  getToken() {
		// obtener token de cache
		//const oldToken = this.cache.getToken(); //??
		
		// validate if token exists
    //if (!!oldToken) return oldToken

    // obtener token desde BlackBoard
    const newToken = this.getNewToken()
		console.log('getToken => newToken => ', newToken)
    // guarda token en caché
    
    // how do i cache a token?

    // necesito atrapar el error de invalid token o expired token
    // obtener un nuevo token
    return newToken
  }

  getNewToken () {
    try {
			const auth = Buffer.from(`${BB_API_CLIENT_ID}:${BB_API_SECRET}`).toString('base64')
			const request = this.client.get('',{
					headers: {
							Authorization: `Basic ${auth}`
					}
			})
			const token = request.data
			console.log('token', token)
			return token
    } catch (e) {
			console.log('Error getNewToken', e)
    }
  }

  getClient() {
    return this.client
  }
}

export default new BlackBoardApiClient()