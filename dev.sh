#!/bin/bash

if [ -z "$1" ]
then
	printf "%s\n" "$0 [db | start | stop]"
	exit
fi


if [ $1 = "db" ]
then
	mkdir -p database 2> /dev/null
	mongod --dbpath=./database & > /dev/null
elif [ $1 = "start" ]
then
	mkdir -p database 2> /dev/null
	mongod --dbpath=./database & > /dev/null
	yarn --cwd server/. run dev & > /dev/null
	yarn --cwd client/. run dev & > /dev/null
elif [ $1 = "stop" ]
then
	pkill mongod
	pkill node
	pkill yarn
fi
