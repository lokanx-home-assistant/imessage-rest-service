# imessage-rest-service

Run: 
1. Deploy this code to a server running Node.js
1. Run `npm install`
1. Add your ACCESS_TOKEN and ALLOWED_IPS to your environment vars to add some security
1. Fire up with `npm start`

Post JSON sample:

    {
    "title": "Hej",
    "message": "Hello there",
    "number": "+22223445566"
    }

If ACCESS_TOKEN is set add header x-access-token with the ACCESS_TOKEN as value

TODO:
* Switch to HTTPS