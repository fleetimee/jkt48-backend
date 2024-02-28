# JKT48 Private Message

![image 2 (1)](https://github.com/fleetimee/jkt48-backend/assets/45744788/575c3b25-2c1b-474d-9e02-14e0b4f474a6)


### Create a .env file at the app root level for configurations
    NODE_ENV = DEVELOPMENT

    DB_HOST = localhost
    DB_PORT = 5432
    DB_USER = yourusername
    DB_PASSWORD = yourpassword
    DB_DATABASE = yourdbname

    APP_PORT = 8080
    JWT_SECRET_KEY = make-sure-this-secret-key-is-very-secure-in-prod

    ORIGIN = http://127.0.0.1:3000


### Install Packages
    npm install


### Start the application in dev mode
    npm run dev


### Start the application in production mode
    npm run build
    npm run start


### Generate SQL migration script
    npm run generate


### Browser SQL editor
    npm run studio

