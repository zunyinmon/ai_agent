## Express Js ##
npm i express
npm i -D tsx @types/node @types/express

## PRM ##
prisma.io 7 sqlite quick start
https://www.prisma.io/docs/v7/prisma-orm/quickstart/sqlite

 cd day_5
 cd api
 npm install prisma@7.10.0 @types/node @types/better-sqlite3 -D
 npm install @prisma/client@7.10.0 @prisma/adapter-better-sqlite3 dotenv
 npx prisma migrate dev --name init
 npx prisma generate

 ##  node -v\nnvm install 22\nnvm use 22\nnvm alias default 22\nnpm install\nnpx prisma generate
  cd /Users/zun/Documents/0_bob/ai_agent/day_5/api\n\nnvm install 22\nnvm use 22\nnvm alias default 22\n\nnpm install -D tsx @types/node @types/express\nnpm install express\nnpm install prisma@latest @prisma/client@latest\nnpx prisma init --datasource-provider sqlite

## Debug
 1049  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
 1050  source ~/.zshrc
 1051  nvm install 22\nnvm use 22\nnvm alias default 22
 1052  node -v\nnpm -v
 1053  rm -rf node_modules package-lock.json\nnpm cache verify\nnpm install\nnpm install prisma@7 @prisma/client@7\nnpx prisma init --datasource-provider sqlite

## Install dependencies if needed:
 npm i @faker-js/faker --force
 npm i @types/bcrypt --force

## backend execute ts
  npx tsx watch index.ts

## frontEnd execute js
  npm run dev

  cd app
  npm i @tanstack/react-query

## api from terminal
(base) zun@macbookpro ~ % curl -X GET localhost:8800/posts

## mobile & web app only has only one api

## SDK
Expo => expo.dev (mobile => andriod,ios)
