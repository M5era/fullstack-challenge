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
<img width="1721" alt="Screenshot 2022-11-14 at 13 53 46" src="https://user-images.githubusercontent.com/18157225/201677530-461a7f28-200e-4601-a60f-766d80bb3158.png">


# 4. Frontend

```

# install dependencies
cd frontend
npm install

# serve with hot reload at localhost:3000
npm run dev


```

<img width="1202" alt="Screenshot 2022-11-14 at 13 52 36" src="https://user-images.githubusercontent.com/18157225/201678292-d64b4dd2-c386-423e-94d8-f4d7e155d0dd.png">

<img width="1460" alt="Screenshot 2022-11-14 at 13 52 43" src="https://user-images.githubusercontent.com/18157225/201677707-a76e72cb-f127-44e5-afbf-ba320029a0ef.png">

