import axios from 'axios'

const baseURL =  process.env.WP_API_BASE
const WP_USER =  process.env.WORDPRESS_API_USER
const WP_PASS =  process.env.WORDPRESS_API_PASSWORD

class WordPressApi {

  constructor() {
    if (!WordPressApi.instance) {
      this.client = axios.create({
        baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // Setup authentication
      this.client.interceptors.request.use((config) => {
        console.log('WP API Request URL:', config.baseURL + config.url)
        console.log('WP API Method:', config.method?.toUpperCase())
        console.log('WP API User configured:', WP_USER)
        console.log('WP API Pass configured:', WP_PASS)
        if (WP_USER && WP_PASS) {
          const auth = Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64')
          config.headers.Authorization = `Basic ${auth}`
          console.log('Using Basic Auth for user:', WP_USER)
          console.log('Auth header length:', config.headers.Authorization.length)
        } else {
          console.error('❌ NO WORDPRESS AUTHENTICATION CONFIGURED!')
          console.error('WP_USER:', WP_USER)
          console.error('WP_PASS:', !!WP_PASS ? 'SET' : 'NOT SET')
        }
        return config
      })
      
      // Interceptor para logging
      this.client.interceptors.request.use(
        (config) => {
          console.log('WP API Request:', {
            url: config.url,
            method: config.method,
            data: config.data,
            params: config.params
          });
          return config
        },
        (error) => {
          console.error('WP API Request Error:', error)
          return Promise.reject(error)
        }
      )
      
      this.client.interceptors.response.use(
        (response) => {
          console.log('WP API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
          })
          return response
        },
        (error) => {
          console.error('WP API Response Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data
          })
          return Promise.reject(error)
        }
      )
      WordPressApi.instance = this
    }
  }

  getClient() {
    return this.client
  }
}

export default new WordPressApi()