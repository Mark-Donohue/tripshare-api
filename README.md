# TripShare API
This is the back-end API application for TripShare. It is written using [Node](https://nodejs.org/en/) and [Express](https://expressjs.com/) and a [MongoDB](https://www.mongodb.com/) persistance layer.

## Running Locally
To run TripShare API locally, please have [npm](https://docs.npmjs.com/about-npm) installed on your machine. Once installed, execute the following commands:

```bash
npm install
npm start
```

If you would like to interact with TripShare API through a UI, please see the [TripShare UI](https://github.com/Mark-Donohue/tripshare-ui) project for instructions on how to set up and run a UI instance locally.

## Environment Variables
In order for the API to function properly, the following environment variables must be set within a `nodemon.json` file placed within the root directory of the project.

| Variable       | Decsription                                                  |
|----------------|--------------------------------------------------------------|
| DB_USER        | The username of the MongoDB instance.                        |
| DB_PASSWORD    | The password of the MongoDB instance.                        |
| DB_NAME        | The name of the MongoDB instance.                            |
| DB_CLUSTER     | The cluster on which the MongoDB instance is running.        |
| GOOGLE_API_KEY | Key that authenticates and allows access to Google Maps API. |
| JWT_KEY        | The private key for using JSON web tokens.                   |

## Acknowledgment
A big thank you to Maximilian Schwarzmüller and Manuel Lorenz for their instruction and MERN guide.

## License
[MIT](https://choosealicense.com/licenses/mit/)


