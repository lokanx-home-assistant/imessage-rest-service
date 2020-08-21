# imessage-rest-service

A REST service that will transform incomming data and send it as imessages. 
This could for example be used together with Home Assistant REST notify integration.

The service only supports plain text imessages.

This service only runs on Mac OS X and needs native messages application installed (and logged into an iCloud account)
The numbers that you want to send to needs to be stored under a contact in your address book. 
The messages will be sent as logged in user in messages application. If using for home automation notifying, I suggest you 
create a seoarate "system" iCloud account to separate messages from real persons.


### Installation: 
1. Deploy this code to a server (with Mac OS X as OS) running Node.js
2. Run `npm install`
3. Generate certificates (see bellow)
4. Add your ACCESS_TOKEN and ALLOWED_IPS to your environment vars to add some basic security
5. Fire up with `npm start`


### Generate SSL Certificates

    openssl req -nodes -days 3650 -new -x509 -keyout server.key -out server.cert

The server.key and server.cert needs to be in the same directory as app.js.


### Post JSON sample:

    {
      "message": "Hello there",
      "number": "+22223445566",
      "title": "Hej"
    }


### JSON attributes explaination:

    message: Message to send, format: plain text (mandatory)
    number: Phone number that blongs to one of your contacts, format +22223445566 (mandatory)
    title: Title to prefix message with, format: plain text (optional)

If ACCESS_TOKEN is set in .env add http header x-access-token with the your choosen ACCESS_TOKEN as value in all requests to the service.

The complete message that will be sent is in format &lt;title&gt; - &lt;message&gt;.
If you want to concat title and message with something else between, uncomment and change TITLE_MESSAGE_CONCATENATION in .env.


### Home Assistant Configuration Example

If want to use this rest service from Home Assistant, this is what should be added

    notify:

    # Imessage using REST
    - name: imessage
        platform: rest
        resource: !secret imessage_resource
        method: POST_JSON
        verify_ssl: false
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

Some explanations:

Following needs to be defined in your secrets.yaml
* imessage_resource 
* imessage_access_token
* imessage_number_john_doe

Like this for example:

    # https://<IP_OF_HOME_ASSISTANT_SERVER>:<PORT>/webhook
    message_resource: https://192.168.1.333:8888/webhook
    # Access token defined in .env
    imessage_access_token: 66a4c348-36ff-43b6-aeb8-e9cc122bbe36
    # Person phone number
    imessage_number_john_doe: "+22223445566"

The fragment under _# Persons_ could be repeated as many times as you want. Just make sure have a unique name and target defined for each person/number.

If not using access token remove the following lines

        headers: 
          x-access-token: !secret imessage_access_token

   
And now you could invoke it from an automation as any other notify service

