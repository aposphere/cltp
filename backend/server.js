const express = require('express')
const { Pool } = require('pg')
const cors = require('cors')

const app = express()

const STORE = new Map()


const endpoint = process.env.ENDPOINT || 'http://localhost'
const port = process.env.PORT || '8080'
const dbEndpoint = process.env.POSTGRES_ENDPOINT || 'http://testdb'
const dbPort = process.env.POSTGRES_PORT || '5432'
const dbDatabase = process.env.POSTGRES_DATABASE || 'test'
const frontendEndpoint = process.env.FRONTEND_ENDPOINT || 'http://localhost'
const frontendPort = process.env.FRONTEND_PORT || '4200'

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false, limit: '50mb' }))

// parse application/json
app.use(express.json({ limit: '50mb' }))

// Add a list of allowed origins.
// If you have more origins you would like to add, you can add them to the array below.
const allowedOrigins = ['http://localhost:4200', `${frontendEndpoint}:${frontendPort}`];

app.use(cors(
{
  origin: allowedOrigins
}));

app.get("/**", (req, response) => 
{
  console.log(`GET: ${req.originalUrl}`)
  response.send('[cltp] backend ready!')
})

app.post("/**", async (req, response, next) => 
{
  console.log(`POST: ${req.originalUrl}`)
  const query = req.body.query
  const username = req.body.username
  const password = req.body.password
  console.log(`RUN QUERY (${username}): ${query}`)

  if (!query || !username || !password) return next(new Error("POST body is mal-formed"))

  try
  {
    if (!STORE.has(username))
    {
      const pool = new Pool(
      {
        user: username,
        host: dbEndpoint,
        database: dbDatabase,
        password: password,
        port: dbPort
      })
      STORE.set(username, pool)
    }

    let client
    try
    {
      client = await STORE.get(username).connect()

      await client.query("START TRANSACTION")

      const res = await client.query(query)

      await client.query("COMMIT")

      response.json(res)
    }
    catch (e)
    {
      try 
      { 
        console.log(`ROLLING BACK QUERY (${username}): ${query}`)
        client.query('ROLLBACK');
        return next(e)
      } 
      catch (e) 
      { 
        console.error("Error while rolling back")
        throw e
      }
    }
    finally
    {
      if (client) client.release()
    }
  }
  catch (e)
  {
    console.error(e)
    return next(new Error("Could not connect to database"))
  }
})

app.post((err, req, response, next) =>
{
  response.status(400).json(err);
})

app.listen(port, () => {
  console.log(`Backend proxy listening at ${endpoint}:${port}`)
})