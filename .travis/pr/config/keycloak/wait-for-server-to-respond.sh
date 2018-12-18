#!/bin/bash
attempt_counter=0
max_attempts=60
wait_between_attempts=5

SERVER="$1"

echo "Waiting for server to be online at $SERVER"
until $(curl --output /dev/null --silent --head --fail "$SERVER"); do
    if [ ${attempt_counter} -eq ${max_attempts} ];then
      echo ""
      echo "Maximum of $max_attempts attempts reached"
      exit 1
    fi

    printf '.'
    attempt_counter=$(($attempt_counter+1))
    sleep $wait_between_attempts
done

echo "Server $SERVER is online"