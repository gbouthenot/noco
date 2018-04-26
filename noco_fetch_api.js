const fetch = require('node-fetch')
const headers = {Authorization: 'Bearer bb643fe7846f51763eab49fb682d7c34b9986381'}
const nocoUrl = 'https://api.noco.tv/1.1'

async function bl (url) {
  url = nocoUrl + url
  let resp = await fetch(url, {headers: headers})
  resp = await resp.json()
  // console.log(resp)
  console.log(JSON.stringify(resp, undefined, 2))
}

bl('/shows?elements_per_page=500&page=0')

// bl('/shows?elements_per_page=5000&page=0')
// bl('/types?elements_per_page=5000&type_of=families')
