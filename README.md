# Spaceship-Disaster

A 4 player co-op game in which you and your friends try to survive in a dysfunctional spaceship while fighting for command.

## Installation

Installation is done by first installing all the required node packages through 

```
npm install
```

You are also required to run a redis server on your machine, for linux OS this is done by simply doing
```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install redis-server
```
To check whether redis has been properly installed, run
```
redis-cli -v
```
and
```
sudo service redis-server restart
```
to ensure that the redis server runs.

## Running the game server
```
npm run dev
```
