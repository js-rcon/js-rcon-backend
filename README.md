# JS-RCON-Backend

A lightweight, powerful, and modular RCON powered TF2 server controller. Due to the modularity of this project, it's also possible to remove all the pre-existing modules and add your own for a different game, like CS:GO.

## Getting Started

### Prerequisites

Getting what you need is easy! You only need to install NodeJS and Git. The text provided below will install NodeJS version 8 on Ubuntu and other Debian-based systems, along with git.
```bash
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs && sudo apt-get install git -y
```

### Installing

Since this project is so lightweight, the installation procedure is quite small.

**Step 1**
Clone the git repo and enter the directory
```
git clone https://github.com/js-rcon/js-rcon-backend && cd js-ron-backend
```

**Step 2**
Install necessary node modules
```
npm i
```

**Step 3**
Create and edit the necessary files. The only two mandatory files needed for the project to run are `.env` and `users.json`. Rename `.env.example` to `.env` and open it with your choice of a text editor to fill out all fields.
```bash
mv .env.example .env
```
```
LISTEN_PORT=8080

SESSION_SECRET=whateveryouwant

RCON_ADDRESS=xx.xx.xxx.xxx

RCON_PASSWORD=xyz
```

**Step 4**
Rename `users.json.example` to `users.json` and edit the user records to your liking.
```bash
mv users.json.example users.json
```
```json
{

  "records": [

    { "id": 1, "username": "jack", "password": "secret", "access":   ["*"] },

    { "id": 2, "username": "jill", "password": "birthday", "access": ["*"] }

  ]

}
```

**Step 5**
Restrict access to `users.json` and `.env` to enhance security from other system users.
```bash
chown 700 users.json .env 
```

**Step 6**
Run the project and go to `localhost:8080` to test it.
```bash
node index.js
```

That's it, you're done!

## Built With

* [Express](https://expressjs.com/) - Used to handle incoming http requests
* [Socket.IO](https://socket.io/) - Used to handle incoming websocket messages, and to send them from the browser
* [node-srcds-rcon](https://github.com/randunel/node-srcds-rcon) - Used to connect to RCON server
* [Winston](https://github.com/winstonjs/winston) - Logging errors and other information
* [Passport](http://www.passportjs.org/) - Base authentication module
* [passport-local](https://github.com/jaredhanson/passport-local) - Username and password authentication
* [passport.socketio](https://github.com/jfromaniello/passport.socketio) - Authentication with websockets
* [NeDB](https://github.com/louischatriot/nedb) - Memory-based session store
* [nedb-session-store](https://github.com/JamesMGreene/nedb-session-store) - Middleware for storing sessions using NeDB and passport

## Contributing

Guide written soon!

## Authors

* **Curtis Fowler** - *Creator* - [caf203](https://github.com/caf203)

See the list of [contributors](https://github.com/js-rcon/js-rcon-backend/contributors) who participated in this project.

## License

This project is licensed under the GNU AGPLv3 License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* **Linus Willner** - *Creator of web interface* - [linuswillner](https://github.com/linuswillner)