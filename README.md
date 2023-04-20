## 📱 Restaurant App

This is an restaurant app prototype that would let you register, login, get menus, and create order.

## 🛠️ Installation Steps

Clone project
``` bson
git clone https://github.com/salmoonisme/mini-project.git
```
## 🪛 If you already have Postgres and Redis in your machine
Create .env file 
```bson
PORT = 9999
JWT_SECRET = "yourjwtstringhere"
REDIS_DOCKER
```

Then run this command
``` bson
npm run dev
```
to start the application server

## 🪛 If not, use Docker instead
Create .env file 
```bson
PORT = 9999
JWT_SECRET = "yourjwtstringhere"
REDIS_DOCKER = redis
```

Then run this command with your Docker application opened
``` bson
docker-compose up --build
```
to start building depedencies, migrate table, and starting the server
