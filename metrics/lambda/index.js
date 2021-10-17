// Initialize
const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION });
const cw = new AWS.CloudWatch({ apiVersion: '2010-08-01' });

exports.handler = async (event, context) =>
{
    // Parse the payload
    const body = JSON.parse(event.body)

    // Verify the payload
    if (body.value === undefined || body.metric === undefined || body.environment === undefined) return {
        statusCode: 400,
        body: JSON.stringify(body),
    }

    console.log(`Receive metric '${body.metric}' with value '${body.value}' in environment '${body.environment}'.`)

    // Create the datapoint
    const datapoint =
    {
        MetricData:
        [
            {
                MetricName: body.metric,
                Dimensions:
                [
                    {
                        Name: 'app-name',
                        Value: 'cltp'
                    },
                    {
                        Name: 'environment',
                        Value: body.environment
                    }
                ],
                Value: body.value
            },
        ],
        Namespace: 'cltp/usz'
    };

    let response


    // Wrapped the putMetricData call in a new Promise object.
    await new Promise((resolve, reject) =>
    {
        // Put the datapoint
        cw.putMetricData(datapoint, function(err, data)
        {
            if (err)
            {
                response =
                {
                    statusCode: 500,
                    body: err.message,
                }
                console.log(err)
            }
            else
            {
                response =
                {
                    statusCode: 200,
                    body: JSON.stringify(body),
                }
                console.log(data)
            }

            resolve()
        })
    })

    // Send response
    return response;
};
