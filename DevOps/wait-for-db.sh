# #!/bin/sh
# # Wait for PostgreSQL to be available
# until PGPASSWORD=$DB_PASSWORD psql -h "$1" -p "$2" -U "$DB_USER" -d "$DB_NAME" -c '\q'; do
#   >&2 echo "Postgres is unavailable - sleeping"
#   sleep 1
# done

# >&2 echo "Postgres is up - executing command"
# exec "$@"