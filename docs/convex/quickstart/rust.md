# Rust Quickstart

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Learn how to query data from Convex in a Rust app with Tokio.

1. Create a Cargo project

   Create a new Cargo project.

   ```
   cargo new my_app

   cd my_app
   ```

2. Install the Convex client and server libraries

   To get started, install the `convex` npm package which enables you to write your backend.

   And also install the `convex` Rust client library, the `tokio` runtime, and `dotenvy` for working with `.env` files.

   ```
   npm init -y && npm install convex && cargo add convex tokio dotenvy
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

   Exporting a query function from this file declares an API function named after the file and the export name, `"tasks:get"`.

   convex/tasks.ts

   ```
   import { query } from "./_generated/server";



   export const get = query({

     handler: async ({ db }) => {

       return await db.query("tasks").collect();

     },

   });
   ```

7. Connect the app to your backend

   In the file `src/main.rs`, create a `ConvexClient` and use it to fetch from your `"tasks:get"` API.

   src/main.rs

   ```
   use std::{

       collections::BTreeMap,

       env,

   };



   use convex::ConvexClient;



   #[tokio::main]

   async fn main() {

       dotenvy::from_filename(".env.local").ok();

       dotenvy::dotenv().ok();



       let deployment_url = env::var("CONVEX_URL").unwrap();



       let mut client = ConvexClient::new(&deployment_url).await.unwrap();

       let result = client.query("tasks:get", BTreeMap::new()).await.unwrap();

       println!("{result:#?}");

   }
   ```

8. Run the app

   Run the app and see the serialized list of tasks.

   ```
   cargo run
   ```

See the complete [Rust documentation](https://docs.rs/convex/latest/convex/).
