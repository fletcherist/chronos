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
const sum = array => array.reduce((acc, el) => acc + el, 0)
const inBetween = (from, to) => value => Math.max(from, Math.min(value, to))
const inBetweenArray = (from, to) => (values) => values.map(value => inBetween(from, to, value))
const withProbability = probability => Math.random() > (1 - probability)

const getDistributionPointRelation = (axisValues) => {
  const axisSum = sum(axisValues)
  return axisValues.map(value => value / axisSum) // Sum always equals to 1
}

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
    return Object.freeze({
      x: xs,
      y: ys,
      relation: getDistributionPointRelation(ys)
    })
  }
})()

// @TODO
PRESETS.linear = (() => {
  return null
})()

PRESETS.defaultPreset = PRESETS.gaussian


class Network {
  constructor() {
    this.clients = {}
    this.counter = 0
  }

  addClient() {
    const clientId = (this.counter++).toString()
    this.clients[clientId] = {
      id: clientId,
      timestampAdded: Date.now(),
      stats: {
        success: 0,
        error: 0
      }
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

const getTimePassed = (startSubscriptionTime, allTime) =>
  (Date.now() - startSubscriptionTime) / allTime

// calc how many actions will be fired on that particular point
const spreadActionsOnPointRelation = (actions, pointRelation) =>
  pointRelation.map(point => point * actions)
const findCurrentPointIndex = (distribution, timePassed) =>
  Math.floor(distribution.x.length * timePassed)


class Client extends Network {
  constructor({
    actions,
    per,
    preset = PRESETS.defaultPreset
  }) {
    super()
    this.client = this.addClient()
    this.preset = null
    this.presets = PRESETS
    this.currentPreset = preset

    this.actionsNeeded = actions
    this.actionsCompleted = 0
    this.per = per
    this.DISTRIBUTION_POINTS_COUNT = 100

    this.startSubscriptionTime = null
  }

  subscribe(observer) {
    this.distribution = this.currentPreset({
      values: this.DISTRIBUTION_POINTS
    })
    this.actionsPerPoint = spreadActionsOnPointRelation(this.actionsNeeded, this.distribution.relation)
    this.timeElapsedOnPoint = this.per / this.DISTRIBUTION_POINTS_COUNT

    this.startSubscriptionTime = Date.now()
    this.observer = observer

    console.log('actions per point', this.actionsPerPoint)
    console.log(this.per)

    return this.tick()
  }

  tick() {
    const timePassed = getTimePassed(this.startSubscriptionTime, this.per)
    const currentPointIndex = findCurrentPointIndex(this.distribution, timePassed)

    if (!this.actionsPerPoint[currentPointIndex]) {
      this.startSubscriptionTime = Date.now()
      return this.tick()
    }
    const timeout = this.timeElapsedOnPoint / this.actionsPerPoint[currentPointIndex]
    this.timeoutId = setTimeout(() => {
      // console.log(
      //   'completed', this.actionsCompleted / this.actionsNeeded,
      //   'time elapsed', timePassed,
      //   'app', timeout
      // )
      this.actionsCompleted++
      this.observer.call()
      return this.tick()
    }, timeout)
  }

  unsubscribe() {
    clearTimeout(this.timeoutId)
    this.timeoutId = null
  }

  next() {

  }

  setPreset() {

  }
}

const client = new Client({
  actions: 10000,
  per: 1000 * 60
})

let count = 0
client.subscribe(function() {
  return false
})

setTimeout(() => null, 100000)

module.exports.presets = PRESETS

