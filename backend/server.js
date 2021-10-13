// Import libs
const express = require('express')
const sql = require('mssql')
const cors = require('cors')
const multer = require('multer')

// Create objects
const app = express()
const post = multer()

// Get env vars
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

// Create the MSSQL connection pool
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

// Flag to indicate connection success
let connected = false

// Log errors
pool.on('error', e => console.error(e))


// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false, limit: '50mb' }))

// Parse application/json
app.use(express.json({ limit: '50mb' }))

// Add a list of allowed origins.
// If you have more origins you would like to add, you can add them to the array below.
const allowedOrigins = ['http://localhost:4200', `${frontendEndpoint}:${frontendPort}`];

// Apply cors
app.use(cors(
{
  origin: allowedOrigins
}));

// Catch all GET requests and return status response
app.get("/**", (req, response) =>
{
  console.log(`GET: ${req.originalUrl}`)
  response.send('[cltp] backend ready!')
})

// Catch all POST requests and parse multipart/form-data if necessary
app.post("/**", post.none(), async (req, response, next) =>
{
  console.log(`POST: ${req.originalUrl}`)

  // Get the params
  const query = req.body.query
  const username = req.body.username
  const password = req.body.password

  // Check the service password
  if (password !== servicePassword) return response.status(401).send("Service password invalid")

  // Check the connection falg
  if (!connected)
  {
    // Connect to the database on the first request and set the connection flag afterwards
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
      // Create a transaction
      transaction = pool.transaction()

      // Start the transaction
      await transaction.begin()

      // Run the query
      request = transaction.request()

      // Await the results if there are any
      const res = await request.query(query)

      // Commit on success of the query
      await transaction.commit()

      // Return the response as json
      response.json(res)
    }
    catch (e)
    {
      try
      {
        // Roll back the query should an error have been detected
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

// Generic error response
app.post((err, req, response, next) =>
{
  response.status(400).json(err);
})

// Start the webserver
app.listen(port, () => console.log(`Backend proxy listening at ${endpoint}:${port}`))
