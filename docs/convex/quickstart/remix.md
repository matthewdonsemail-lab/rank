# Remix Quickstart

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Learn how to query data from Convex in a Remix app.

1. Create a Remix site

   Create a Remix site using the `npx create-remix@latest` command.

   <br />

   ```
   npx create-remix@latest my-remix-app
   ```

2. Install the Convex library

   To get started, install the `convex` package.

   ```
   cd my-remix-app && npm install convex
   ```

3. Set up a Convex dev deployment

   Next, run `npx convex dev`. This will prompt you to log in with GitHub, create a project, and save your production and deployment URLs.

   It will also create a `convex/` folder for you to write your backend API functions in. The `dev` command will then continue running to sync your functions with your dev deployment in the cloud.

   ```
   npx convex dev
   ```

4. Create sample data for your database

   Create a `sampleData.jsonl` file at the root of you app and fill it with the sample data given.

   sampleData.jsonl

   ```
   {"text": "Buy groceries", "isCompleted": true}

   {"text": "Go for a swim", "isCompleted": true}

   {"text": "Integrate Convex", "isCompleted": false}
   ```

5. Add the sample data to your database

   Now that your project is ready, add a `tasks` table with the sample data you just created in `sampleData.jsonl` into your Convex database with the `import` command.

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

7. Wire up the ConvexProvider

   Modify `app/root.tsx` to set up the Convex client there to make it available on every page of your app.

   app/root.tsx

   ```
   import {

     Links,

     Meta,

     Outlet,

     Scripts,

     ScrollRestoration,

     useLoaderData,

   } from "@remix-run/react";

   import { ConvexProvider, ConvexReactClient } from "convex/react";

   import { useState } from "react";



   export async function loader() {

     const CONVEX_URL = process.env["CONVEX_URL"]!;

     return { ENV: { CONVEX_URL } };

   }



   export function Layout({ children }: { children: React.ReactNode }) {

     const { ENV } = useLoaderData<typeof loader>();

     const [convex] = useState(() => new ConvexReactClient(ENV.CONVEX_URL));

     return (

       <html lang="en">

         <head>

           <meta charSet="utf-8" />

           <meta name="viewport" content="width=device-width, initial-scale=1" />

           <Meta />

           <Links />

         </head>

         <body>

           <ConvexProvider client={convex}>{children}</ConvexProvider>

           <ScrollRestoration />

           <Scripts />

         </body>

       </html>

     );

   }



   export default function App() {

     return <Outlet />;

   }
   ```

8. Display the data in your app

   In `app/routes/_index.tsx` use `useQuery` to subscribe your `api.tasks.get` API function.

   app/routes/\_index.tsx

   ```
   import type { MetaFunction } from "@remix-run/node";

   import { api } from "convex/_generated/api";

   import { useQuery } from "convex/react";



   export const meta: MetaFunction = () => {

     return [

       { title: "New Remix App" },

       { name: "description", content: "Welcome to Remix!" },

     ];

   };



   export default function Index() {

     const tasks = useQuery(api.tasks.get);

     return (

       <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>

         <h1>Welcome to Remix</h1>

         {tasks === undefined

           ? "loading..."

           : tasks.map(({ _id, text }) => <div key={_id}>{text}</div>)}

       </div>

     );

   }
   ```

9. Start the app

   Start the app, open <http://localhost:5173> in a browser, and see the list of tasks.

   ```
   npm run dev
   ```

Remix uses the React web library. See the complete [React documentation](/client/react/overview.md).
