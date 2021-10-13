# SQL Schema

The SQL schema required for this system has been design on MSSQL Server 2019 and requires a MSSQL Server 2019 to run. Any other version has not been tested and is therefore not supported.

There are **3** essential files (starting with a digit) to setup the system and have to be executed in the correct order.

## Setup the database

Ideally, a dedicated database in the server is provided to the system.

### 1. Schema

The schema used by the system is called `cltp` and all tables and views are attributed to it.

Either create this schema manually or run the script `/sql/1.init-schema.sql`.

### 2. Tables and Views

All tables, views, constraints, etc. are defined in the script `/sql/2.schema.sql`. Run this script to setup it up.

### 3. User

Ideally, a dedicated user login and database user gets created for this system. This allows for restrictive access control for the access the system uses, only allowing exactly the permissions the system needs and nothing more, thus increasing the security and removing and possibility of compromising other data on the database.

Either create this user manually or run the script `/sql/3.user.sql`.

_The user only requires `SELECT` and `INSERT` permissions on **all** tables and views in the schema `cltp`._


## Migrate the database

To migrate to a newer version of the system, for each version requiring a change of the database schema, a migration script is available following the format `/sql/migration.vX.X.X.sql` which has to be executed and applied before installing the new system.
