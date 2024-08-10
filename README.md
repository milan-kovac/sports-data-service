***Backend Engineer Assignment***


👩‍🚀 **Requirements** 
---

+ Node.js **v20.11.0**
+ Nest.js **v10.3.1**
+ PostgreSQL
+ Docker


🚀 **Setup** 
---

Make sure you are in the root of the server folder.

+ Create **`.env`** file. (You can copy **`.env.example`** file)
+ Run **`docker-compose up -d`** to setup docker container for database.
+ Run **`npm install`** to install all the dependencies.
+ Run **`npm run migration:generate -- ./src/db/migrations/FirstMigration`** to create first migration.
+ Run **`npm run start`** to start server.

## 💻 **Local** 
+ ***[Server](http://[::1]:3001/)***
+ ***[Swagger](http://[::1]:3001/api)***
+ ***[Adminer](http://localhost:8881/)***
+ ***[Kafdrop](http://localhost:9000/)***
