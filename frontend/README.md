# Frontend

The frontend is an [Angular](https://angular.io) app, running as a SPA (Single Page Application) in the browser of the client. It provides a clean interface of the data stored in the database allowing for efficient work flows and fail-save handling of the data.

The frontend app has following building blocks.

## Authentication

There are two possibilites to interact with the system. For example, to upload a personal sample, no authentication is required and the actions performed by the systems are attributed to the special user `anonymous`.

But for most functionality, an identifier (ex. `jos` for _John Smith_) and a password is required to access.

## Queries

The queries are directly built in the respective workflows, but use a common service to send them to the [proxy backend](../backend). There are two methods available, for authenticated queries and for anonymous queries.

## Input Devices

The system offers **3** different input methods. All QR codes can be sent to the system using following options:

* \[Default\] Scanned with a Barcode Scanner
* Captured via the Camera _(should the Browser have access to it)_
* Manually through an \<input\> field

## Functionality

The main part of the system is the different workflows available on the _/home_ page. Additionally, dashboards are available for insights into the data and an audit log can also be displayed.

For more information about the workflows, the mapping of the elements, the logic behind the workflows, etc., please have a look at the [guides](../documentation/guides) and [system-architecture](../documentation/system-architecture).

***

## Linting

A linter is available to verify code quality. Run `ng lint`.

## Development

For development, the frontend can also be started locally under `http://localhost:4200/`, which has been added to the _cors_ header in the backend.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
