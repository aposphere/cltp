# Proxy Backend

The proxy backends job is to expose a possibility for the [frontend](../frontend) to run queries on the [database](../sql), as the app running the context of the browser is not allowed to directly communicate with a database and thus requires a proxy service running alongside with the database on the server.

## Database Connection

The backend establishes a connection with the database using the [user described here](../database#3--user).

## Requests

The backend listens to HTTP(S) POST requests sent by the frontend and executes them on behalf of the frontend and the operator logged into the system.

## Technology

The technology used for this proxy backend is [nodejs](http://nodejs.org), a powerful and well established open-source light-weight webserver (alike Apache, .NET, etc.).
