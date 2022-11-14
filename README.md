# Airbank: Full Stack Coding Challenge

# 1. Database Setup

First, the Database needs to be deployed. Personally, I just used the Postgres App (with an UI) to run. 
However, even if you use a different method for deploying, these are the important details:

```
Name: airbank_psql
Port: 5432
username: marcserafin
password: postgres
(location: /server)
```

Resulting in the URL:

```
DATABASE_URL="postgresql://marcserafin:postgres@localhost:5432/postgres?schema=public"
```

Once deployed, make sure the 'data' directory is in the `server` directory. We will need it later to import the datasets.

# 2. Prepare Data

The csv files in the ``data`` directory are already cleaned and prepared (see `transactions_cleaned.csv`)
However if a rerun of the `main.py` script is required, do the following:

```
cd server
cd data
python main.py
```


# 3. GraphQL Server

Setup Prisma:
```
cd graphql
npm install @prisma/client
npx prisma db push
```
Run Code in index.ts:
```
npx ts-node index.ts
```
Seed database:
```
npx prisma db seed
```

# 4. Frontend

```

# install dependencies
cd frontend
npm install

# serve with hot reload at localhost:3000
npm run dev


```



