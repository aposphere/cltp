CREATE LOGIN [cltp] WITH PASSWORD = 'cltp-aposphere', CHECK_POLICY = OFF, CHECK_EXPIRATION = OFF, DEFAULT_DATABASE = [cltp-prod]

CREATE USER [cltp]  FOR LOGIN [cltp]
GO

GRANT INSERT, SELECT ON SCHEMA::[cltp] TO [cltp]