#!/bin/bash

if [ -z "$1" ]
then
	printf "%s\n" "$0 [db | start]"
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
	yarn --cwd server/. run start & > /dev/null
	yarn --cwd client/. run start & > /dev/null
fi
