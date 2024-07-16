Launch the project in development:
docker compose up --watch (don't forget --watch so it can use the hot reload)
You can add the flag --build if you need to rebuild the images.

Launch the project in production:
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
You can add the flag --build if you need to rebuild the images.
