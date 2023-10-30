# KdbxChrome - ServerSide

This is the repository containing the server that runs to discuss with the browser. 

## Run it locally
First, create a config.json file.  
```
{
    port: 3000, //The url port
    token: "", //A token used to encrypt data when communicating
    filePath: "" //The path where your database is stored
}
```

Then just type `npm run start` to run it.

## Deploy

Run `npm run deploy`, and this will generate an executable.