# Covid Lab Testing Platform

This is the repo containing the source code, the deployment configs, the manuals and the documentation.

## Source Code

The source code of the different services working together are all located in this repo. In-depth documentation is provided in the respectitive subfolder while usage and concepts are documented in [documentation](#documentation).

* Database Schema: [`/database/README.md`](/database/README.md)
* Frontend: [`/frontend/README.md`](/frontend/README.md)
* Backend: [`/backend/README.md`](/backend/README.md)
* PHP Setup (Alternative): [`/php/README.md`](/php/README.md)

## Deployment Configs

There are **3** deployment configuration files provided and pre-configured in this repo.

### Productive

The default productive deployment configuration is defined in [`/docker-compose.productive.yml`] configuration the [backend](./backend) and the [frontend](./frontend).

Following values need to be configured accordingly:

* Backend
  * `ENDPOINT`/`PORT`: Provide the endpoint/port of the backend service running on
  * `FRONTEND_ENDPOINT`/`FRONTEND_PORT`: Provide the endpoint/port of the frontend service running on
  * `MSSQL_*`: Provide the database connection config
  * `SERVICE_PASSWORD`: Set the service password

* Frontend
  * `./proxy/certs:/etc/nginx/certs`: Set the host path to the location of the certs (`server.crt`, `server.key`)

### PHP Setup (Alternative)

The php setup (alternative) can be tested also with a test configuration in a docker environment using an apache-image to simulate the apache server installation.

### Development

The development deployment configuration can be used to develop the service, providing also local MSSQL databases, exposed backend access, etc.

## Manuals

The manuals of how to use and setup the service are located in the [manuals](/manuals/README.md).

## Documentation

The system documentation is located in the [documentation](/documentation/README.md).

*** 

## Development Notes

_To the developers using this repo._

### Prerequisites

Following services need to be available on the dev machine in order to develop.

* docker + docker-compose (deployment testing)
* git (source code management)
* node + npm (scripts and frontend serving)
* angular-cli (frontend serving and linting)

The preferred editor is _VSCode_.

### Debug Files

The file `EXAMPLE_TEST_RESULT.csv` is an example of the output of the PCR machine and can be used to test the workflows. Otherwise, you can also modify and use the `generate-mock-results.js` to create a fresh example result csv.

The `generate-local-ca-and-certificate.sh` generates a local _SSL_ certificate for local testing. The local domain used by default is `cltp.ll`.
