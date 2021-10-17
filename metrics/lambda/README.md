# AWS Lambda Function

This is a _lambda_ function ready to accept the metrics format and post it in the CloudWatch of AWS. Make sure you give the _lambda_ function following additional permissions `cloudwatch:PutMetricData`. This lambda requires a REST Api Gateway allowing CORS and providing a `POST` endpoint for the _lambda_ function.

The endpoint has to be adjusted in the `/frontend/src/environment` files.
