const Rx = require('rxjs')

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

const client = new Client()

let count = 0
client.subscribe(function() {
  console.log('hello world', count++)
})

const withProbability = probability => Math.random() > (1 - probability)
const gaussianFn = (x, a, b) =>
  1 / a * Math.sqrt(2 * Math.PI) *
  (Math.E ** (- (x - b) / 2 * Math.pow(a, 2)))