const express = require('express')
const sql = require('mssql')
const cors = require('cors')
const multer = require('multer')

const app = express()
const post = multer()

const endpoint = process.env.ENDPOINT || 'http://localhost'
const port = process.env.PORT || '8080'
const dbEndpoint = process.env.MSSQL_ENDPOINT || 'http://db'
const dbPort = +process.env.MSSQL_PORT || 1433
const dbDatabase = process.env.MSSQL_DATABASE || 'test0'
const dbUsername = process.env.MSSQL_USERNAME || 'cltp'
const dbPassword = process.env.MSSQL_PASSWORD || 'cltp-aposphere'
const frontendEndpoint = process.env.FRONTEND_ENDPOINT || 'http://localhost'
const frontendPort = process.env.FRONTEND_PORT || '4200'
const servicePassword = process.env.SERVICE_PASSWORD || 'cltp'

const pool = new sql.ConnectionPool(
{
  user: dbUsername,
  server: dbEndpoint,
  database: dbDatabase,
  password: dbPassword,
  port: dbPort,
  options: 
  {
    trustServerCertificate: true // self-signed
  }
})
let connected = false
pool.on('error', e => 
{
  console.error(e)
})


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

app.post("/**", post.none(), async (req, response, next) => 
{
  console.log(`POST: ${req.originalUrl}`)
  const query = req.body.query
  const username = req.body.username
  const password = req.body.password
  console.log(query, username, password, req.body)

  if (password !== servicePassword) return response.status(401).send("Service password invalid")

  if (!connected)
  {
    console.log("CONNECTING TO DB …")
    const poolConnect = pool.connect()
    await poolConnect;
    console.log("CONNECTED!")
    connected = true
  }

  console.log(`RUN QUERY (${username}): ${query}`)

  try
  {

    let transaction
    let request
    try
    {
      transaction = pool.transaction()

      await transaction.begin()

      request = transaction.request()

      const res = await request.query(query)

      await transaction.commit()

      response.json(res)
    }
    catch (e)
    {
      try 
      { 
        console.log(`ROLLING BACK QUERY (${username}): ${query}`)
        transaction.rollback();
        return next(e)
      } 
      catch (e) 
      { 
        console.error("Error while rolling back")
        throw e
      }
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