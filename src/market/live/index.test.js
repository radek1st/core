import { TestScheduler } from 'rxjs'
import { socketObservable, candleObservable, createCandle } from '.'

describe('Live market data', () => {
  it('should create a socket connection and emit fills data', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const lhsMarble1 = 'a'
    const lhsMarble2 = '-m-n-j'
    const expected = '---x--'

    const lhs1Input = {
      a: { message: 'socket connected' },
    }

    const lhs2Input = {
      m: {
        unhandled_data: {
          R: true,
          I: 1,
        },
      },
      n: {
        H: 'CoreHub',
        M: 'updateExchangeState',
        A: [{
          MarketName: 'USDT-BTC',
          Nounce: 1063222,
          Buys: [{
            Type: 1,
            Rate: 10928.316924,
            Quantity: 0,
          }, {
            Type: 2,
            Rate: 10918.99999998,
            Quantity: 0.52377906,
          }, {
            Type: 0,
            Rate: 10777.77653016,
            Quantity: 0.73745183,
          }],
          Sells: [{
            Type: 1,
            Rate: 11030.69999999,
            Quantity: 0,
          }, {
            Type: 0,
            Rate: 11613,
            Quantity: 0.00215814,
          }],
          Fills: [{
            OrderType: 'SELL',
            Rate: 10918.99999998,
            Quantity: 0.1,
            TimeStamp: '2018-03-02T18:07:37.427',
          }, {
            OrderType: 'SELL',
            Rate: 10928.316924,
            Quantity: 0.94404427,
            TimeStamp: '2018-03-02T18:07:36.647',
          }],
        }],
      },
      j: {
        H: 'CoreHub',
        M: 'updateExchangeState',
        A: [{
          MarketName: 'USDT-BTC',
          Nounce: 1063223,
          Buys: [],
          Sells: [{
            Type: 0,
            Rate: 11070.96599998,
            Quantity: 0.02662253,
          }, {
            Type: 1,
            Rate: 11070.96599999,
            Quantity: 0,
          }],
          Fills: [],
        }],
      },
    }

    const expectedMap = {
      x: [{
        OrderType: 'SELL',
        Rate: 10918.99999998,
        Quantity: 0.1,
        TimeStamp: '2018-03-02T18:07:37.427',
      }, {
        OrderType: 'SELL',
        Rate: 10928.316924,
        Quantity: 0.94404427,
        TimeStamp: '2018-03-02T18:07:36.647',
      }],
    }

    const lhs1$ = testScheduler.createHotObservable(lhsMarble1, lhs1Input)
    const lhs2$ = testScheduler.createHotObservable(lhsMarble2, lhs2Input)

    const actual$ = socketObservable(lhs1$, lhs2$)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
  it('should create candle from array of ticker data', () => {
    const ticks = [
      { OrderType: 'BUY',
        Rate: 0.0923,
        Quantity: 1,
        TimeStamp: '2018-01-24T19:07:03.063',
      },
      { OrderType: 'BUY',
        Rate: 0.0924,
        Quantity: 1,
        TimeStamp: '2018-01-24T19:08:03.063',
      },
      { OrderType: 'BUY',
        Rate: 0.0925,
        Quantity: 1,
        TimeStamp: '2018-01-24T19:09:03.063',
      },
    ]
    expect(createCandle(ticks)).toEqual([
      1516817343, // closeTime
      0.0923, // openPrice
      0.0925, // highPrice
      0.0923, // lowPrice
      0.0925, // closePrice
      3, // volume
    ])
  })
  it('should create candle from ticker data after x seconds', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const lhsMarble = 'x-y-(z|)'
    const expected = '----(a|)'

    const lhsInput = {
      x: [
        { OrderType: 'BUY',
          Rate: 0.0923,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:07:03.063',
        },
      ],
      y: [
        { OrderType: 'BUY',
          Rate: 0.0924,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:08:03.063',
        },
      ],
      z: [
        { OrderType: 'BUY',
          Rate: 0.0925,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:09:03.063',
        },
      ],
    }

    const expectedMap = {
      a: [[
        1516817343, // closeTime
        0.0923, // openPrice
        0.0925, // highPrice
        0.0923, // lowPrice
        0.0925, // closePrice
        3, // volume
      ]],
    }

    const lhs$ = testScheduler.createHotObservable(lhsMarble, lhsInput)

    const actual$ = candleObservable(lhs$, 0.04, testScheduler)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
  it('should concat arrays after buffer', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const lhsMarble = '-x-y-(z|)'
    const expected = '-a-b-(c|)'

    const lhsInput = {
      x: [
        { OrderType: 'BUY',
          Rate: 0.0923,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:07:03.063',
        },
      ],
      y: [
        { OrderType: 'BUY',
          Rate: 0.0924,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:08:03.063',
        },
      ],
      z: [
        { OrderType: 'BUY',
          Rate: 0.0925,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:09:03.063',
        },
      ],
    }

    const expectedMap = {
      a: [[
        1516817223, // closeTime
        0.0923, // openPrice
        0.0923, // highPrice
        0.0923, // lowPrice
        0.0923, // closePrice
        1, // volume
      ]],
      b: [
        [
          1516817223, // closeTime
          0.0923, // openPrice
          0.0923, // highPrice
          0.0923, // lowPrice
          0.0923, // closePrice
          1, // volume
        ],
        [
          1516817283, // closeTime
          0.0924, // openPrice
          0.0924, // highPrice
          0.0924, // lowPrice
          0.0924, // closePrice
          1, // volume
        ],
      ],
      c: [
        [
          1516817223, // closeTime
          0.0923, // openPrice
          0.0923, // highPrice
          0.0923, // lowPrice
          0.0923, // closePrice
          1, // volume
        ],
        [
          1516817283, // closeTime
          0.0924, // openPrice
          0.0924, // highPrice
          0.0924, // lowPrice
          0.0924, // closePrice
          1, // volume
        ],
        [
          1516817343, // closeTime
          0.0925, // openPrice
          0.0925, // highPrice
          0.0925, // lowPrice
          0.0925, // closePrice
          1, // volume
        ],
      ],
    }

    const lhs$ = testScheduler.createHotObservable(lhsMarble, lhsInput)

    const actual$ = candleObservable(lhs$, 0.005, testScheduler)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
  it('shouldnt emit after if no data', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const lhsMarble = '--------|'
    const expected = '--------|'

    const lhs$ = testScheduler.createHotObservable(lhsMarble)

    const actual$ = candleObservable(lhs$, 0.005, testScheduler)

    testScheduler.expectObservable(actual$).toBe(expected)
    testScheduler.flush()
  })
  it('should retry after error', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const lhsMarble = '-x-y-(z|)'
    const expected = '-a---(c|)'

    const lhsInput = {
      x: [
        { OrderType: 'BUY',
          Rate: 0.0923,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:07:03.063',
        },
      ],
      y: 'hest', // in case of random data we get an error
      z: [
        { OrderType: 'BUY',
          Rate: 0.0925,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:09:03.063',
        },
      ],
    }

    const expectedMap = {
      a: [[
        1516817223, // closeTime
        0.0923, // openPrice
        0.0923, // highPrice
        0.0923, // lowPrice
        0.0923, // closePrice
        1, // volume
      ]],
      c: [
        [
          1516817343, // closeTime
          0.0925, // openPrice
          0.0925, // highPrice
          0.0925, // lowPrice
          0.0925, // closePrice
          1, // volume
        ],
      ],
    }

    const lhs$ = testScheduler.createHotObservable(lhsMarble, lhsInput)

    const actual$ = candleObservable(lhs$, 0.005, testScheduler)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
})