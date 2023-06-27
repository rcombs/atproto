#!/usr/bin/env sh

# Example usage:
# ./with-test-db.sh psql postgresql://pg:password@localhost:5433/postgres -c 'select 1;'

dir=$(dirname $0)
compose_file="$dir/docker-compose.yaml"

# whether this particular script started the container or if it was running beforehand
started_container=false

trap on_sigint INT
on_sigint() { 
  echo # newline
  if $started_container; then
    docker compose -f $compose_file rm -f --stop --volumes db_test
  fi
  exit $?
}

# check if the container is already running
if [[ -z `docker compose -f $compose_file ps --format json --status running | grep db_test` ]]; then
  docker compose -f $compose_file up --wait --force-recreate db_test
  started_container=true
  echo # newline
else
  echo "db_test already running"
fi

# Based on creds in compose.yaml
export PGPORT=5433
export PGHOST=localhost
export PGUSER=pg
export PGPASSWORD=password
export PGDATABASE=postgres
export DB_POSTGRES_URL="postgresql://pg:password@localhost:5433/postgres"
"$@"
code=$?

echo # newline
if $started_container; then
  docker compose -f $compose_file rm -f --stop --volumes db_test
fi

exit $code
