#!/bin/bash
go build
killall jeedev-api3
nohup ./jeedev-api3 &
