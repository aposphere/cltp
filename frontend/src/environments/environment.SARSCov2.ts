/**
 * The productive environment variables for the special php installation on the /SARSCov2/ global path
 */
 export const environment =
 {
  production: true,
  backend: '/SARSCov2/backend/',
  servicePassword: 'cltp',
  metricsEndpoint: `https://4k8bv9rlf0.execute-api${ '' }.eu-central-1.amazonaws.com${ '' }/default/cltp-usz-metrics`, // Add obscurification to url
  metricsFailSilently: true,
};
