# Hadoc File Sharing Redux
New and Improved Hadoc File Sharing

## Configuration
This is made to work with my [**GP File Server**](https://github.com/lucaryholt/gp_file_server).

The server needs a **.env** file simply called **.env**, in its root directory.
In this file you need to configure the following fields:
```
FILE_SERVER_URL=
FILE_SERVER_AUTHKEY=

DB_SERVER_CONNECTION_STRING=
DB_NAME=
```

 - *FILE_SERVER_URL* is the URL where the **GP File Server** is available.

 - *FILE_SERVER_AUTHKEY* is the password for the **GP File Server**.

 - *DB_SERVER_CONNECTION_STRING* is the connection string for the MongoDB server.
   - Example: "mongodb+srv://\<USERNAME>:\<PASSWORD>@mongodb.net"

 - *DB_NAME* is the database name on the MongoDB server.
 
## Running the server
To run the server you can run **npm run start-prod** in the server directory. 
