# Nuxt Quickstart

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Learn how to query data from Convex in a Nuxt app.

This quickstart guide uses a [community-maintained](/client/vue/nuxt.md) Nuxt client for Convex.

1. Create a Nuxt application

   Create a Nuxt application using the `npm create nuxt@latest my-nuxt-app` command.

   Convex will work with any of the official modules but to follow this quickstart skip installing them for now.

   <br />

   ```
   npm create nuxt@latest my-nuxt-app
   ```

2. Install the Convex library

   To get started, install the `convex` package and the `convex-nuxt` module to your Nuxt application.

   ```
   cd my-nuxt-app && npm install convex && npx nuxi module add convex-nuxt
   ```

3. Add the Convex URL

   Add the Convex URL to your `nuxt.config.ts` file.

   nuxt.config.ts

   ```
   export default defineNuxtConfig({

     compatibilityDate: '2025-07-15',

     devtools: { enabled: true },

     modules: ['convex-nuxt'],

     convex: {

       url: process.env.CONVEX_URL

     },

   })
   ```

4. Set up a Convex dev deployment

   Next, run `npx convex dev`. This will prompt you to log in with GitHub, create a project, and save your production and deployment URLs.

   It will also create a `convex/` folder for you to write your backend API functions in. The `dev` command will then continue running to sync your functions with your dev deployment in the cloud.

   ```
   npx convex dev
   ```

5. Create sample data for your database

   In a new terminal window, create a `sampleData.jsonl` file with some sample data.

   sampleData.jsonl

   ```
   {"text": "Buy groceries", "isCompleted": true}

   {"text": "Go for a swim", "isCompleted": true}

   {"text": "Integrate Convex", "isCompleted": false}
   ```

6. Add the sample data to your database

   Now that your project is ready, add a `tasks` table with the sample data into your Convex database with the `import` command.

   ```
   npx convex import --table tasks sampleData.jsonl
   ```

7. (optional) Define a schema

   Add a new file `schema.ts` in the `convex/` folder with a description of your data.

   This will declare the types of your data for optional typechecking with TypeScript, and it will be also enforced at runtime.

   <br />

   convex/schema.ts

   ```
   import { defineSchema, defineTable } from "convex/server";

   import { v } from "convex/values";



   export default defineSchema({

     tasks: defineTable({

       text: v.string(),

       isCompleted: v.boolean(),

     }),

   });
   ```

8. Expose a database query

   Add a new file `tasks.ts` in the `convex/` folder with a query function that loads the data.

   Exporting a query function from this file declares an API function named after the file and the export name, `api.tasks.get`.

   convex/tasks.ts

   ```
   import { query } from "./_generated/server";



   export const get = query({

     args: {},

     handler: async (ctx) => {

       return await ctx.db.query("tasks").collect();

     },

   });
   ```

9. Display the data in your app

   In `app.vue` use `useQuery` to subscribe your `api.tasks.get` API function.

   app/app.vue

   ```
   <script setup lang="ts">

   import { api } from "../convex/_generated/api";

   const { data: tasks } = useConvexQuery(api.tasks.get);

   </script>



   <template>

     <div>

       <h1>Tasks</h1>

       <ul>

         <li v-for="task in tasks" :key="task._id">

           <span>{{ task.text }}</span>

         </li>

       </ul>

     </div>

   </template>
   ```

10. Update script to start development server

    By default, Convex stores environment variables in `.env.local`, and Nuxt looks for environment variables in `.env`.

    To use the default `npm run dev` command, update your `package.json` to use the `--dotenv .env.local` flag.

    package.json

    ```
    {

      "name": "nuxt-app",

      "private": true,

      "type": "module",

      "scripts": {

        "build": "nuxt build",

        "dev": "nuxt dev --dotenv .env.local",

        "generate": "nuxt generate",

        "preview": "nuxt preview",

        "postinstall": "nuxt prepare"

      },

      "dependencies": {

        "convex": "^1.25.2",

        "convex-nuxt": "^0.1.3",

        "nuxt": "^3.17.6",

        "vue": "^3.5.17",

        "vue-router": "^4.5.1"

      }

    }
    ```

11. Start the app

    Start the app, open <http://localhost:3000> in a browser, and see the list of tasks.

    ```
    npm run dev
    ```

For more examples, take a look at the [Nuxt Convex module repository](https://github.com/chris-visser/convex-nuxt).

See the complete [Nuxt npm package documentation](https://www.npmjs.com/package/convex-nuxt).
