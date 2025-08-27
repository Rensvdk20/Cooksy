# Cooksy

Cooksy is a web application for managing my recipes, so I don't keep losing them in the notes app on my phone.<br />
This project is built with Nuxt 3 and integrates with services like ImageKit for media storage.

## Dashboard
The dashboard allows easy editing of recipes without the usual constraints most recipe websites impose.<br />
You can move blocks around and set them up exactly how you want.
<br /><br />
<img src="https://i.imgur.com/8gIf2EN.png" alt="Dashboard" width="400">

## Technologies

-   **[Nuxt 3](https://nuxt.com/)**
-   **[Vue 3](https://vuejs.org/)**
-   **[Typescript](https://www.typescriptlang.org/)**
-   **[Prisma](https://www.prisma.io/)**
-   **[Tailwind](https://tailwindcss.com/)**
-   **[Postgresql](https://www.postgresql.org/)**

## Authentication & Security

-   **[Nuxt Auth Utils](https://github.com/atinux/nuxt-auth-utils)**
-   **[Nuxt Security](https://github.com/Baroshem/nuxt-security)**

## Requirements

- Node.js (v20 or higher)
- Postgresql database
- ImageKit account

## Setup

-   Clone the repository:

    ```bash
    git clone https://github.com/Rensvdk20/Cooksy.git
    ```

-   Install dependencies:

    ```bash
    npm install
    ```

-   Set up environment variables:

    -   Create a `.env` file in the root directory.
    -   Add the following variables:

        ```properties
        # Database
        DATABASE_URL=<Your database URL>

        # Nuxt Auth
        NUXT_SESSION_PASSWORD=<Your Nuxt session password>

        # Imagekit
        IMAGEKIT_PUBLIC_KEY=<Your Imagekit public key>
        IMAGEKIT_PRIVATE_KEY=<Your Imagekit private key>
        IMAGEKIT_URL_ENDPOINT=<Your Imagekit url>
        ```

-   Set up the database

    ```bash
    npx prisma migrate dev
    ```

## Usage

To start the development server, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.
