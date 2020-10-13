const axios = require('axios')
const parser = require('fast-xml-parser')
const { parse } = require('node-html-parser')
const { unescape } = require('html-escaper')

class ConfluenceComments {
  /**
   * 
   * @param {string} confluenceUrl confluence url
   * @param {Object[]} auth 
   * @param {string} auth[].username username
   * @param {string} auth[].password password
   */
  constructor(confluenceUrl, auth) {
    if (!confluenceUrl || !auth.username || !auth.password) throw 'Missing parameter confluenceUrl or auth credintails'
    this.confluenceUrl = confluenceUrl
    this.method = 'spaces/createrssfeed.action'
    this.requestParams = { types: 'comment', maxResults: 200 }
    this.auth = { username: auth.username, password: auth.password }
    this.parseParams = { ignoreAttributes: false, attributeNamePrefix: '' }
    console.log(this.auth)
  }

  async _sendRequest (url) {
    try {
      const request = await axios({
        method: 'GET',
        url: url,
        auth: this.auth,
        params: this.requestParams
      })
      const { data } = request
      return data
    } catch (err) {
      throw err.code ?  err.code : err.response.status
    }
  }

  async _parseComments (space) {
    try {
      const url = this.confluenceUrl + this.method 
      const data = await this._sendRequest(url)
      const { feed } = parser.parse(data, this.parseParams)
      const comments = feed.entry
        .map(item => {
          //transform data to human-readable
          item.author = item.author.name
          item.title = item.title.replace(/^(Re: )/g, '')
          item.link = item.link.href.replace(/(&amp;)/g, '&')
          item.updated = Date.parse(item.updated)
          
          //transform summary to human-readable data
          const decodedSummary = unescape(item.summary['#text']).replace(/(\r\n)/g, '')
          const commentBody = parse(decodedSummary).querySelector('.feed')
          const isReply = commentBody.querySelectorAll('div').length === 2 ? false : true
          const commentText = commentBody.querySelector('div').innerText.trim()

          return {
            title: item.title,
            link: item.link,
            author: item.author,
            updated: item.updated,
            isReply,
            commentText,
            space: space
          }
        })
      return comments
    } catch (err) {
      throw err
    }
  }
  /**
   * Get comments for Confluence Space from RSS
   * @param {string} space Confluence space code e.g 'root'
   * @param {number=5} timeSpan days offset
   * @returns {Promise} Promise with Array of objects contains comments
   */
  getComments (space, timeSpan = 5) {
    this.requestParams.spaces =  space
    this.requestParams.timeSpan = timeSpan
    try {
      return this._parseComments(space, timeSpan)
    } catch (err) {
      throw err
    }
  }
  
}

module.exports = ConfluenceComments
