// fp composition & pipe helpers

console.log(console.clear())
const pipe = (fn, ...fns) => (...args) => fns.reduce((result, fn) => fn(result), fn(...args))
const compose = (...fns) => (...args) => pipe(...fns.reverse())(...args)

const concat = list => Array.prototype.concat.bind(list)
const promiseConcat = f => x => f().then(concat(x))
const promiseReduce = (acc, x) => acc.then(promiseConcat(x))
/*
 * serial executes Promises sequentially.
 * @param {funcs} An array of funcs that return promises.
 * @example
 * const urls = ['/url1', '/url2', '/url3']
 * serial(urls.map(url => () => $.ajax(url)))
 *     .then(console.log.bind(console))
 */
const serial = funcs => funcs.reduce(promiseReduce, Promise.resolve([]))

// math helpers
const range = (from, to) => {
  const arr = []
  for (let i = from; i < to; i++) arr[i] = i
  return arr
}
const inBetween = (from, to) => value => Math.max(from, Math.min(value, to))
const inBetweenArray = (from, to) => (values) => values.map(value => inBetween(from, to, value))
const withProbability = probability => Math.random() > (1 - probability)

const PRESETS = {}
// Normal (Gaussian) Distribution
// Check out https://en.wikipedia.org/wiki/Normal_distribution
PRESETS.gaussian = (() => {
  const gaussianPartPI = (x, a, b) => 1 / a * Math.sqrt(2 * Math.PI)
  const gaussianPartE = (x, a, b) => (Math.E ** (- Math.pow(x - b, 2) / Math.pow(a, 2)))
  const gaussianFn = (x, a = 0.6, b = 0.5) => gaussianPartPI(x, a, b) * gaussianPartE(x, a, b)
  const chronosDistribution = (x, a = 0.5, b = 0.5) =>
    gaussianPartE(x, a, b)

  const compensatePeak = peak => Math.abs(peak - 0.05)
  const compensatePower = power => Math.min(power * 1.082, 1)

  return function gaussian({
    power = 0.5,
    peak = 0.5,
    values = 100
  }) {
    peak = compensatePeak(peak)
    power = compensatePower(power)

    const distributionFunction = compose(
      inBetween(0.00001, 1),
      chronosDistribution
    )
    const xs = range(0, values).map(x => x / values)
    const ys = xs.map(x => distributionFunction(x, power, peak))
    const xsys = xs.map((x, index) => [x, ys[index]])
    return { x: xs, y: ys }
  }
})()

// @TODO
PRESETS.linear = (() => {
  return null
})()


class Network {
  constructor() {
    this.clients = {}
    this.counter = 0
  }

  addClient() {
    const clientId = (this.counter++).toString()
    this.clients[clientId] = {
      id: clientId,
      timestampAdded: Date.now()
    }
    return this.clients[clientId]
  }

  removeClient() {

  }

  getClientById() {

  }
}

const network = new Network()

const ONE_HOUR = 1000 * 60 * 60
const ONE_DAY = ONE_HOUR * 24

const getTimeFromDayBeginning = () => {
  const dateBeginning = new Date()
  dateBeginning.setHours(0)
  dateBeginning.setMinutes(0)
  dateBeginning.setSeconds(0)
  const now = new Date()
  return now - dateBeginning
}

const getTimePassed = () => getTimeFromDayBeginning() / ONE_DAY
const getDistributionPointSum = (distribution) => distribution.y.reduce((acc, el) =>
  acc + el, 0)
const getDistributionPointRelation = (distribution) => {
  const distributionYSum = getDistributionPointSum(distribution)
  return distribution.y.map(yValue => yValue / distributionYSum) // Sum equals to 1
}


class Client extends Network {
  constructor() {
    super()
    this.client = this.addClient()
    this.preset = null
    this.presets = PRESETS
    this.currentPreset = this.presets.gaussian
    console.log(this.client)
  }

  subscribe(observer) {
    this.distribution = this.currentPreset({
      values: 10
    })
    console.log('sum', getDistributionPointRelation(this.distribution))
    observer.call()
    setTimeout(() => {
      return observer.call()
    }, 1000)
  }

  unsubscribe() {

  }

  next() {

  }

  setPreset() {

  }
}

const client = new Client()

let count = 0
client.subscribe(function() {
  console.log('hello world', count++)
})

setTimeout(() => null, 100000)

module.exports.presets = PRESETS

