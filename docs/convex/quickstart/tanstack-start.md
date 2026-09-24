# TanStack Start Quickstart

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

TanStack Start is in Release Candidate

[TanStack Start](https://tanstack.com/start/latest) is a new React framework currently in the Release Candidate stage. You can use it today but there may be bugs or breaking changes before a stable release.

To get setup quickly with Convex and TanStack Start run

**`npm create convex@latest -- -t tanstack-start`**

or follow the guide below.

To use an auth provider with Convex and TanStack Start, see the [TanStack Start + Clerk guide](/client/tanstack/tanstack-start/clerk.md) or the [TanStack Start + WorkOS AuthKit guide](/auth/authkit/add-to-app.md).

***

Learn how to query data from Convex in a TanStack Start site.

1. Create a TanStack Start site

   Create a TanStack Start app using the `create-start-app` command:

   ```
   npx create-start-app@latest
   ```

2. Install the Convex client and server library

   To get started with Convex install the `convex` package and a few React Query-related packages.

   ```
   npm install convex @convex-dev/react-query @tanstack/react-router-ssr-query @tanstack/react-query
   ```

3. Update src/routes/\_\_root.tsx

   Add a `QueryClient` to the router context to make React Query usable anywhere in the TanStack Start site.

   src/routes/\_\_root.tsx

   ```
   import { QueryClient } from "@tanstack/react-query";

   import { createRootRouteWithContext } from "@tanstack/react-router";

   import { Outlet, Scripts, HeadContent } from "@tanstack/react-router";

   import * as React from "react";



   export const Route = createRootRouteWithContext<{

     queryClient: QueryClient;

   }>()({

     head: () => ({

       meta: [

         {

           charSet: "utf-8",

         },

         {

           name: "viewport",

           content: "width=device-width, initial-scale=1",

         },

         {

           title: "TanStack Start Starter",

         },

       ],

     }),

     component: RootComponent,

   });



   function RootComponent() {

     return (

       <RootDocument>

         <Outlet />

       </RootDocument>

     );

   }



   function RootDocument({ children }: { children: React.ReactNode }) {

     return (

       <html>

         <head>

           <HeadContent />

         </head>

         <body>

           {children}

           <Scripts />

         </body>

       </html>

     );

   }
   ```

4. Update src/router.tsx

   Replace the file `src/router.tsx` with these contents.

   This creates a `ConvexClient` and a `ConvexQueryClient` and wires in a `ConvexProvider`.

   src/router.tsx

   ```
   import { createRouter } from "@tanstack/react-router";

   import { QueryClient } from "@tanstack/react-query";

   import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

   import { ConvexQueryClient } from "@convex-dev/react-query";

   import { ConvexProvider } from "convex/react";

   import { routeTree } from "./routeTree.gen";



   export function getRouter() {

     const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!;

     if (!CONVEX_URL) {

       console.error("missing envar VITE_CONVEX_URL");

     }

     const convexQueryClient = new ConvexQueryClient(CONVEX_URL);



     const queryClient: QueryClient = new QueryClient({

       defaultOptions: {

         queries: {

           queryKeyHashFn: convexQueryClient.hashFn(),

           queryFn: convexQueryClient.queryFn(),

         },

       },

     });

     convexQueryClient.connect(queryClient);



     const router = createRouter({

       routeTree,

       defaultPreload: "intent",

       context: { queryClient },

       scrollRestoration: true,

       Wrap: ({ children }) => (

         <ConvexProvider client={convexQueryClient.convexClient}>

           {children}

         </ConvexProvider>

       ),

     });

     setupRouterSsrQueryIntegration({ router, queryClient });



     return router;

   }
   ```

5. Set up a Convex dev deployment

   Next, run `npx convex dev`. This will prompt you to log in with GitHub, create a project, and save your production and deployment URLs.

   It will also create a `convex/` folder for you to write your backend API functions in. The `dev` command will then continue running to sync your functions with your dev deployment in the cloud.

   ```
   npx convex dev
   ```

6. Create sample data for your database

   In a new terminal window, create a `sampleData.jsonl` file with some sample data.

   sampleData.jsonl

   ```
   {"text": "Buy groceries", "isCompleted": true}

   {"text": "Go for a swim", "isCompleted": true}

   {"text": "Integrate Convex", "isCompleted": false}
   ```

7. Add the sample data to your database

   Now that your project is ready, add a `tasks` table with the sample data into your Convex database with the `import` command.

   ```
   npx convex import --table tasks sampleData.jsonl
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

   Replace the file `src/routes/index.tsx` with these contents.

   The `useSuspenseQuery` hook renders the API function `api.tasks.get` query result on the server initially, then it updates live in the browser.

   src/routes/index.tsx

   ```
   import { convexQuery } from "@convex-dev/react-query";

   import { useSuspenseQuery } from "@tanstack/react-query";

   import { createFileRoute } from "@tanstack/react-router";

   import { api } from "../../convex/_generated/api";



   export const Route = createFileRoute("/")({

     component: Home,

   });



   function Home() {

     const { data } = useSuspenseQuery(convexQuery(api.tasks.get, {}));



     return (

       <div>

         {data.map(({ _id, text }) => (

           <div key={_id}>{text}</div>

         ))}

       </div>

     );

   }
   ```

10. Start the app

    Start the app, open <http://localhost:3000> in a browser, and see the list of tasks.

    ```
    npm run dev
    ```

For more see the [TanStack Start with Convex](/client/tanstack/tanstack-start/.md) client documentation page.
