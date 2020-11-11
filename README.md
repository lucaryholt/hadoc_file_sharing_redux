# Hadoc File Sharing Redux
New and Improved Hadoc File Sharing

## Configuration
This is made to work with my [**GP File Server**](https://github.com/lucaryholt/gp_file_server).
Check its repository for instructions on how to set it up.

### .env
The server needs a **.env** file simply called **.env**, in its root directory.
In this file you need to configure the following fields:
```
FILE_SERVER_URL=
FILE_SERVER_AUTHKEY=
DB_SERVER_CONNECTION_STRING=
DB_NAME=
ACCESS_PORT=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
FILE_ACTIVE_TIME=
REFRESH_TOKEN_ACTIVE_TIME=
MAIL_HOST=
MAIL_SERVICE=
MAIL_USERNAME=
MAIL_PASSWORD=
SERVICE_URL=
```

 - *FILE_SERVER_URL*: the URL where the **GP File Server** is available.

 - *FILE_SERVER_AUTHKEY*: the password for the **GP File Server**.

 - *DB_SERVER_CONNECTION_STRING*: the connection string for the MongoDB server.
   - Eg: "mongodb+srv://\<USERNAME>:\<PASSWORD>@mongodb.net"

 - *DB_NAME*: the database name on the MongoDB server.
 
 - *ACCESS_PORT*: where you want the server to listen for requests.
 
 - *ACCESS_TOKEN_SECRET*: used by **JWT** to sign access tokens.
 
 - *REFRESH_TOKEN_SECRET*: used by **JWT** to sign refresh tokens.
 
 - *FILE_ACTIVE_TIME*: how old files need to be before they are deleted (in milliseconds).
 
 - *REFRESH_TOKEN_ACTIVE_TIME*: how old refresh tokens need to be before they are deleted (in milliseconds).
 
 - *MAIL_HOST*: the smtp url for the mail host. 
   - Eg: 'smtp.gmail.com'.
   
 - *MAIL_SERVICE*: the email service used for sending email. **Nodemailer** sets up some settings automatically based on this.
   - Eg: 'gmail'.
   
 - *MAIL_USERNAME*: username for the mail account. Most likely the email address.
 
 - *MAIL_PASSWORD*: password for the mail account.
 
 - *SERVICE_URL*: the url where this service is available. Used to make links for emails.
 
## Running the server
To run the server you can run **npm run start-prod** in the server directory. 
