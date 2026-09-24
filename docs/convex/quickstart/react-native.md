# React Native Quickstart

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Learn how to query data from Convex in a React Native app.

1. Create a React Native app

   Create a React Native app using the `npx create-expo-app` command.

   ```
   npx create-expo-app my-app
   ```

2. Install the Convex client and server library

   To get started, install the `convex` package which provides a convenient interface for working with Convex from a React app.

   Navigate to your app and install `convex`.

   ```
   cd my-app && npm install convex
   ```

3. Set up a Convex dev deployment

   Next, run `npx convex dev`. This will prompt you to log in with GitHub, create a project, and save your production and deployment URLs.

   It will also create a `convex/` folder for you to write your backend API functions in. The `dev` command will then continue running to sync your functions with your dev deployment in the cloud.

   ```
   npx convex dev
   ```

4. Create sample data for your database

   Create a `sampleData.jsonl` file with some sample data.

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

7. Reset the Expo project

   If you haven't done so yet, reset the Expo project to get a fresh `app` directory.

   ```
   npm run reset-project
   ```

8. Connect the app to your backend

   In `_layout.tsx`, create a `ConvexReactClient` and pass it to a `ConvexProvider` wrapping your component tree.

   app/\_layout.tsx

   ```
   import { ConvexProvider, ConvexReactClient } from "convex/react";

   import { Stack } from "expo-router";



   const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {

     unsavedChangesWarning: false,

   });



   export default function RootLayout() {

     return (

       <ConvexProvider client={convex}>

         <Stack>

           <Stack.Screen name="index" />

         </Stack>

       </ConvexProvider>

     );

   }
   ```

9. Display the data in your app

   In `index.tsx` use the `useQuery` hook to fetch from your `api.tasks.get` API.

   app/index.tsx

   ```
   import { api } from "@/convex/_generated/api";

   import { useQuery } from "convex/react";

   import { Text, View } from "react-native";



   export default function Index() {

     const tasks = useQuery(api.tasks.get);

     return (

       <View

         style={{

           flex: 1,

           justifyContent: "center",

           alignItems: "center",

         }}

       >

         {tasks?.map(({ _id, text }) => (

           <Text key={_id}>{text}</Text>

         ))}

       </View>

     );

   }
   ```

10. Start the app

    Start the app, scan the provided QR code with your phone, and see the serialized list of tasks in the center of the screen.

    ```
    npm start
    ```

React native uses the same library as React web. See the complete [React documentation](/client/react/overview.md).
