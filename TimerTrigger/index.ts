import { AzureFunction, Context } from "@azure/functions"
import { Cookie, CookieJar } from "tough-cookie"
import requestPromise = require("request-promise")

const email = process.env.EMAIL
const password = process.env.PASSWORD
const apiKey = process.env.MACKREL_API_KEY

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
  const checkedCount = await sendCheckedcountToMackerel()
  console.log(new Date().toLocaleString(), checkedCount)
  context.done();
};

const fetchCheckedCount = async function(userToken : string) : Promise<number> {
    const cookie = Cookie.fromJSON({
        key: 'user',
        value: userToken,
        path: '/',
        domain: 'techbookfest.org'
    })
    cookie.domain = 'techbookfest.org';
    var cookiejar = new CookieJar();
    cookiejar.setCookie(cookie, 'https://techbookfest.org', (err,cookie) => {})
    const opt = {
      url: 'https://techbookfest.org/api/circle/own',
      cookiejar
    }
    const circles = JSON.parse(await requestPromise(opt))
    const checkedCount = circles.filter(circle => circle.event.id === 'tbf08').map(circle => circle.checkedCount)[0]
    return checkedCount
  }
  
  const re = /^user=([^;]+)/
  
  const signIn = async () => {
    const opt = {
      method: 'POST',
      uri: 'https://techbookfest.org/api/user/login',
      body: JSON.stringify({ email, password }),
      headers: {
        'content-type': 'application/json'
      },
      resolveWithFullResponse: true
    }
    const res = await requestPromise(opt)
    const matched = re.exec(res.headers['set-cookie'][0])
    return matched[1]
  }
  
  const crawl = async () => {
    const userToken = await signIn()
    const checkedCount = await fetchCheckedCount(userToken)
    return checkedCount
  }
  
  const sendToMackerel = async checkedCount => {
      const opt = {
          method: 'POST',
          uri: 'https://api.mackerelio.com/api/v0/services/techbookfest/tsdb',
          body: JSON.stringify([{ name: "circleCheck5", time: Math.floor(new Date().getTime() / 1000), value: checkedCount }]),
          headers: {
            'content-type': 'application/json',
            'X-Api-Key': apiKey
          },
          resolveWithFullResponse: true
        }
      await requestPromise(opt)
  }

  const sendCheckedcountToMackerel = async () => {
    const checkedCount = await crawl()
    await sendToMackerel(checkedCount)  
    return checkedCount
  }
  
export default timerTrigger;
