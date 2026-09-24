# Script Tag Quickstart

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Learn how to query data from Convex from script tags in HTML.

1. Create a new npm project

   Create a new directory for your Convex project.

   ```
   mkdir my-project && cd my-project && npm init -y
   ```

2. Install the Convex client and server library

   Install the `convex` package which provides a convenient interface for working with Convex from JavaScript.

   ```
   npm install convex
   ```

3. Set up a Convex dev deployment

   Next, run `npx convex dev`. This will prompt you to log in with GitHub, create a project, and save your production and deployment URLs.

   It will also create a `convex/` folder for you to write your backend API functions in. The `dev` command will then continue running to sync your functions with your dev deployment in the cloud.

   ```
   npx convex dev
   ```

4. Create sample data for your database

   In a new terminal window, create a `sampleData.jsonl` file with some sample data.

   sampleData.jsonl

   ```
   {"text": "Buy groceries", "isCompleted": true}

   {"text": "Go for a swim", "isCompleted": true}

   {"text": "Integrate Convex", "isCompleted": false}
   ```

5. Add the sample data to your database

   Now that your project is ready, add a `tasks` table with the sample data into your Convex database with the `import` command.

   ```
   npx convex import --table tasks sampleData.jsonl
   ```

6. Expose a database query

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

7. Copy the deployment URL

   Open the `.env.local` file and copy the `CONVEX_URL` of your development environment for use in the HTML file.

8. Add the script to your webpage

   In a new file `index.html`, create a `ConvexClient` using the URL of your development environment.

   Open this file in a web browser and you'll see it run each time the `tasks` table is modified.

   index.html

   ```
   <!doctype html>

   <script src="https://unpkg.com/convex@1.3.1/dist/browser.bundle.js"></script>

   <script>

     const CONVEX_URL = "CONVEX_URL_GOES_HERE";

     const client = new convex.ConvexClient(CONVEX_URL);

     client.onUpdate("tasks:get", {}, (tasks) =>

       console.log(tasks.map((task) => task.text)),

     );

   </script>
   ```

See the complete [Script Tag documentation](/client/javascript/script-tag.md).
