# Blox

## Getting Started

The best way to prepare this application for development is by running the following commands:
```sh
git clone git@github.com:Web-Science-Systems-Development-Group/BloxApp.git
cd BloxApp/frontend
npm i
cd ../backend
npm i
cd ..
```
This will clone the repository and install the necessary dependencies. You can then launch the application via:
```sh
npm run dev
```


## Production

Build the application for a production server by running `npm run build`. You may need to copy private files to the `dist` directory. You can then launch the Node.js server via `node dist/backend/server.js`.

_The build command may currently not be working._
