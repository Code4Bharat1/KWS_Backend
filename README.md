````markdown
# KWS Backend Documentation

## Overview

The **KWS Backend** is designed to support the **Kokan Welfare Society** platform. It utilizes **Node.js** and **Express.js** for the server and **Prisma ORM** to handle interactions with the **PostgreSQL** database. This backend handles various operations such as user authentication, data management, file uploads, and email notifications.

## Features

- **Prisma ORM**: Simplifies interactions with the PostgreSQL database.
- **Database Migrations**: Use Prisma migrations to manage schema changes.
- **API Routes**: Built with Express.js for handling REST API endpoints.
- **Authentication**: Secure user authentication with JWT tokens.
- **Email Notifications**: Integration with Nodemailer for sending emails like password reset links.
- **File Uploads**: Use Multer for handling file uploads.

## Prerequisites

Ensure the following are installed on your system:

- **Node.js**: Version 18.x or later.
- **NPM**: Version 7.x or later.
- **PostgreSQL**: A running PostgreSQL instance to store your data.
- **Prisma CLI**: Prisma CLI to manage migrations and schema.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/kws-backend.git
cd kws-backend
```
````

### 2. Install Dependencies

Install the required dependencies:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following configuration:

```env
DATABASE_URL="postgresql://your-user:your-password@localhost:5432/your-database-name?schema=public"
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-email-password"
JWT_SECRET="your-jwt-secret"
```

Replace the values with your actual PostgreSQL credentials, email information, and JWT secret.

### 4. Initialize Prisma and Migrate the Database

Run the following commands to initialize Prisma, generate the client, and apply the database migrations:

```bash
npx prisma migrate dev --name init
```

This command will create your database schema in PostgreSQL based on the `schema.prisma` file.

### 5. Start the Development Server

```bash
npm run dev
```

This will start the backend server on `http://localhost:5786`.

## Working with Prisma and PostgreSQL

### 1. Install Prisma and PostgreSQL Client

To begin using Prisma with PostgreSQL, install the required dependencies:

```bash
npm install @prisma/client pg
```

### 2. Initialize Prisma

Run the following command to initialize Prisma in your project. This will create a `prisma` folder with a default `schema.prisma` file and `.env` configuration file.

```bash
npx prisma init
```

This will create the following folder structure:

```
prisma/
├── schema.prisma    # Prisma schema file (contains the models, database configuration)
└── .env             # Environment variables (e.g., database URL)
```

### 3. Configure PostgreSQL Database URL

In the `.env` file, configure your PostgreSQL connection string like this:

```env
DATABASE_URL="postgresql://your-user:your-password@localhost:5432/your-database-name?schema=public"
```

Replace `your-user`, `your-password`, and `your-database-name` with the correct values for your PostgreSQL setup.

## Working with Prisma Schema

### 1. Define Data Models in Prisma Schema (`schema.prisma`)

In Prisma, you define your database schema inside the `schema.prisma` file. This file contains the definition of the data models that Prisma will use to generate migrations and interact with the database.

Here’s an example of a `User` model in the Prisma schema:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

- **`id`**: The unique identifier for each user. It is automatically generated and set to auto-increment.
- **`username`**: A unique field to store the user's username.
- **`email`**: A unique field to store the user's email address.
- **`password`**: The hashed password for the user.
- **`createdAt`**: A timestamp field to track when the user was created.

### 2. Apply Database Migrations

After defining your models in the `schema.prisma` file, you need to generate and apply migrations to update the PostgreSQL database.

Run the following command to generate a migration based on the changes in the Prisma schema:

```bash
npx prisma migrate dev --name init
```

- **`--name init`**: This is the name of the migration. You can use any name you prefer.

This command will:

1. **Generate a migration file** in the `prisma/migrations/` folder.
2. **Apply the migration** to your PostgreSQL database.

### 3. Generating Prisma Client

After running the migrations, generate the Prisma Client. Prisma Client is the library you use to interact with your database in the backend code.

```bash
npx prisma generate
```

This will generate the Prisma Client based on the schema and allow you to query the database from your backend.

## How to Change the Schema and Fetch Changes from PostgreSQL

### 1. Modifying the Prisma Schema

If you need to modify the schema, for example, adding a new field or changing an existing model, you simply edit the `schema.prisma` file.

For instance, to add a `role` field to the `User` model:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  role      String   @default("user")  // Added role field
}
```

### 2. Apply New Migrations

After editing the schema, you need to apply the changes to the PostgreSQL database. Run the following Prisma command to create a new migration:

```bash
npx prisma migrate dev --name add_role_to_user
```

This will:

- Generate a new migration to add the `role` field to the `User` table.
- Apply the migration to your PostgreSQL database.

### 3. Fetch Changes from PostgreSQL (Database Synchronization)

Prisma syncs changes between the schema and PostgreSQL automatically when running the migrate command. However, if there are changes in the database that need to be reflected in your schema, you can use the Prisma introspection command to reverse-engineer the database schema into Prisma's schema format.

To introspect an existing PostgreSQL database:

```bash
npx prisma db pull
```

This will update your `schema.prisma` to reflect the current state of your PostgreSQL database, including any new tables or fields that may have been added.

### 4. Viewing Database Changes

After running migrations or introspecting the database, you can check the current state of your database by using the Prisma CLI:

```bash
npx prisma studio
```

This will open Prisma Studio, a web interface that allows you to inspect and manage your data directly.

## Folder Structure

```
kws-backend/
├── src/                        # Main application logic
│   ├── controllers/            # API logic (e.g., user, authentication)
│   ├── models/                 # Prisma models and data models
│   ├── routes/                 # Route definitions for various services
│   ├── middleware/             # Custom middleware (e.g., authentication)
│   ├── utils/                  # Utility functions (e.g., email, CSV parser)
│   └── index.js                # Main entry point for the application
├── .env.local                  # Environment variables
├── prisma/                     # Prisma schema and migrations
├── package.json                # Project metadata and dependencies
└── README.md                   # Documentation file
```

## Key Prisma Commands

Here are some key Prisma commands you will use regularly:

| Command                         | Description                                                                 |
| ------------------------------- | --------------------------------------------------------------------------- |
| `npx prisma init`               | Initializes Prisma and creates the `schema.prisma` and `.env` file.         |
| `npx prisma migrate dev`        | Applies pending migrations to the database and generates the Prisma Client. |
| `npx prisma migrate dev --name` | Creates a new migration with the given name.                                |
| `npx prisma db pull`            | Introspects the database and updates the Prisma schema based on it.         |
| `npx prisma studio`             | Opens Prisma Studio, a UI for managing your database.                       |
| `npx prisma generate`           | Generates the Prisma Client to interact with the database.                  |

## Conclusion

Prisma simplifies the interaction with PostgreSQL by providing an intuitive API and powerful migration capabilities. You can easily modify your schema and apply those changes to your PostgreSQL database without directly writing SQL queries. By using Prisma, you can improve your development workflow and ensure your database remains in sync with your application code.

---

Developers: Sanad Naqvi , Juned khan and Team.

```

```
