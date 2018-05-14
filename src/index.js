const withProbability = probability => Math.random() > (1 - probability)
const gaussianPartPI = (x, a, b) => 1 / a * Math.sqrt(2 * Math.PI)
const gaussianPartE = (x, a, b) => (Math.E ** (- Math.pow(x - b, 2) / Math.pow(a, 2)))
const gaussianFn = (x, a = 0.6, b = 0.5) => gaussianPartPI(x, a, b) * gaussianPartE(x, a, b)
const chronosDistribution = (x, a = 0.5, b = 0.5) =>
  gaussianPartE(x, a, b)
const range = (from, to) => {
  const arr = []
  for (let i = from; i < to; i++) arr[i] = i
  return arr
}
const inBetween = (from, to) => (values) => null

const compensatePeak = peak => peak - 0.05
const compensatePower = power => power

const testFn = () => {
  const maxVal = 10

  const PEAK_AT = compensatePeak(0.5)
  const POWER = compensatePower(1)
  const source = range(0, maxVal)
    .map(x => x / maxVal)
    .map(x => chronosDistribution(x, POWER, PEAK_AT))
    .forEach(v => console.log(v))
}

testFn()

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
class Client extends Network {
  constructor() {
    super()
    this.client = this.addClient()
    this.preset = null
    this.presets = {
      linear: x => x,

    }
    console.log(this.client)
  }

  subscribe(observer) {
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

// const client = new Client()

// let count = 0
// client.subscribe(function() {
//   console.log('hello world', count++)
// })

