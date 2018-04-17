import { Pool } from 'pg'
import { toArrayOfArraysData } from '../parser'
import { dev, test } from '../config/database.json'

const getDBForEnv = env => (env === 'test' ? test : dev)

export const pool = new Pool(getDBForEnv(process.env.NODE_ENV))

const query = async (text, params) => {
  const queryData = await pool.query(text, params)
  return queryData.rows
}

export const sessionQuery = async (params) => {
  const sessionRow = await query(
    `INSERT INTO sessions 
    (name, pair, time_frame, backtest, paper_trade) 
    values ($1, $2, $3, $4, $5)
    RETURNING *`,
    params,
  )
  return sessionRow.length > 0 && sessionRow[0] && sessionRow[0].id
}


export const candleQuery = async (params) => {
  await query(
    `INSERT INTO candles 
    (session_id, close_time, open, high, low, close, volume) 
    values ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    params,
  )
  const dbCandleData = await query(
    'SELECT close_time, open, high, low, close, volume FROM candles WHERE session_id = $1',
    [params[0]],
  )
  return toArrayOfArraysData(dbCandleData)
}

export const signalQuery = async params => (
  query(`INSERT INTO signals (type, candle_id, session_id) 
    VALUES (
      $1, 
      (SELECT id FROM candles 
        WHERE close_time = $2 
        AND session_id = $3
      ),
      $3)`, params)
)

export default query