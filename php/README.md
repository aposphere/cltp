# PHP Setup (Alternative)

The php setup is used in places where only an Apache server is available and no docker environment can be deployed. The php backend replaces what otherwise would have been taken care of by the [backend](../backend). Have a look at the preferred backend option to know more about the functioning as this php backend tries to imitate that as close as possible.

Additionally, instead of serving the frontend using an nginx container, the apache server also provides the frontend as static files.


## Build

To build the PHP setup, use the build scripts `/src/build.sh` to compile it into a zip.

### Default Build

```bash
bash build.sh
```

For a top-level domain setup.

### SARSCov2 Build

```bash
bash build-SARSCov2.sh
```

For the setup where the app lives under the path `/SARSCov2/`. This also uses the special `environment.SARSCov2.ts` in the [frontend](../frontend).


## Technology

The technology used for this php backend is [PHP](https://www.php.net) running on [Apache](https://httpd.apache.org/).
