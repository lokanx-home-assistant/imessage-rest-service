# imessage-rest-service

A REST service that will transform incomming data and send it as imessages.

This service only runs on Mac OS X and needs native message application installed (and logged into an iCloud account)
The numbers that you want to send to needs to be stored under a contact in your address book. 
The messages will be sent as logged in user in message application.

This could be used together with Home Assistant REST notify integration

### Run: 
1. Deploy this code to a server (with Mac OS X as OS) running Node.js
2. Run `npm install`
3. Add your ACCESS_TOKEN and ALLOWED_IPS to your environment vars to add some basic security
4. Fire up with `npm start`

### Post JSON sample:

    {
    "title": "Hej",
    "message": "Hello there",
    "number": "+22223445566"
    }

If ACCESS_TOKEN is set add header x-access-token with the ACCESS_TOKEN as value

### Home Assistant Configuration Example

    notify:

    # Imessage using REST
    - name: imessage
        platform: rest
        resource: !secret imessage_resource
        method: POST_JSON
        headers: 
        x-access-token: !secret imessage_access_token
        message_param_name: "message"
        title_param_name: "title"
        target_param_name: "number"

    # Persons
    - name: imessage_john_doe
        platform: group
        services:
        - service: imessage
            data:
            target: !secret imessage_number_john_doe

And now you could invoke it from an automation as any other notify service

### TODO:
* Switch to HTTPS