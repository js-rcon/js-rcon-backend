# JS-RCON Backend

This repository hosts the code for the server-side component of JS-RCON.

## What is JS-RCON?

JS-RCON is a powerful Source Dedicated Server administration GUI built with JavaScript. At the moment the project only supports Team Fortress 2, but more games are planned to be added later.


## Installation

### Prerequisites

JS-RCON requires the following dependencies:

- [Node.js](https://nodejs.org) (Current version recommended)
- A Source Dedicated Server on [Windows](https://wiki.teamfortress.com/wiki/Windows_dedicated_server) or [Linux](https://wiki.teamfortress.com/wiki/Linux_dedicated_server)
- [SourceMod](https://wiki.alliedmods.net/Installing_SourceMod_(simple)) with the [sm_plist](https://forums.alliedmods.net/showthread.php?t=61013) plugin
- A [Redis](https://redis.io) server

### Installing

TODO (Submodules need to be accounted for, dist versions need to be decided upon, etc)

### Configuration

Create **.env** and **users.json** files based on their examples ([.env.example](.env.example)) and [users.json.example](users.json.example).

**Note:** It might be a good idea to protect the **.env** and **users.json** files from unauthorised access since passwords and tokens are stored in plain text.

### Starting

TODO (Start method may still change)

## Technologies used

The major dependencies of this project are listed here. For full dependency information, see [package.json](package.json).

* [Express.js](https://expressjs.com/)
* [Socket.io](https://socket.io/)
* [srcds-rcon](https://github.com/randunel/node-srcds-rcon)

## License

JS-RCON is licensed under the [GNU Affero General Public License](LICENSE).<br>
JS-RCON © 2018 [Curtis Fowler](https://github.com/caf203) and [Linus Willner](https://github.com/linuswillner).
