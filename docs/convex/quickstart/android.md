# Android Kotlin Quickstart

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Learn how to query data from Convex in a Android Kotlin project.

This quickstart assumes that you have Android Studio, node and npm installed. If you don’t have those tools, take time to install them first.

1. Create a new Android app in Android Studio

   Choose the following options in the wizard.

   ```
   1. Choose the "Empty Activity" template

   2. Name it "Convex Quickstart"

   3. Choose min SDK as 26

   4. Choose Kotlin as the Gradle DSL
   ```

2. Configure the AndroidManifest

   Add the following to your `AndroidManifest.xml`.

   ```
   <?xml version="1.0" encoding="utf-8"?>

   <manifest xmlns:android="http://schemas.android.com/apk/res/android"

       xmlns:tools="http://schemas.android.com/tools">

       <uses-permission android:name="android.permission.INTERNET"/>

       <application>

           <!-- ... existing application contents -->

       </application>

   </manifest>
   ```

3. Configure your dependencies

   Add the following entries to the `:app` `build.gradle.kts` file (ignore IDE suggestion to move them to version catalog for now, if present).

   Ensure that you sync Gradle when all of the above is complete (Android Studio should prompt you to do so).

   ```
   plugins {

       // ... existing plugins

       kotlin("plugin.serialization") version "1.9.0"

   }



   dependencies {

       // ... existing dependencies

       implementation("dev.convex:android-convexmobile:0.8.0@aar") {

           isTransitive = true

       }

       implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")

   }
   ```

4. Install the Convex Backend

   Open a terminal in your Android Studio instance and install the Convex client and server library.

   ```
   npm init -y

   npm install convex
   ```

5. Start Convex

   Start a Convex dev deployment. Follow the command line instructions.

   ```
   npx convex dev
   ```

6. Create a sample data for your database

   Create a new `sampleData.jsonl` file with these contents.

   ```
   {"text": "Buy groceries", "isCompleted": true}

   {"text": "Go for a swim", "isCompleted": true}

   {"text": "Integrate Convex", "isCompleted": false}
   ```

7. Add the sample data to your database

   Open another terminal tab and run.

   ```
   npx convex import --table tasks sampleData.jsonl
   ```

8. Expose a database query

   Create a `tasks.ts` file in your `convex/` directory with the following contents.

   ```
   import { query } from "./_generated/server";



   export const get = query({

     args: {},

     handler: async (ctx) => {

       return await ctx.db.query("tasks").collect();

     },

   });
   ```

9. Create a data class

   Add a new `data class` to your `MainActivity` to support the task data defined above. Import whatever it asks you to.

   ```
   @Serializable

   data class Task(val text: String, val isCompleted: Boolean)
   ```

10. Create your UI

    Delete the template `@Composable` functions that Android Studio created and add a new one to display data from your Convex deployment. Again, import whatever it asks you to.

    ```
    @Composable

    fun Tasks(modifier: Modifier = Modifier) {

        val tasks: Result<List<Task>> by client.subscribe<List<Task>>("tasks:get")

            .collectAsState(Result.success(listOf()))

        LazyColumn(

            modifier = modifier

        ) {

            items(tasks.getOrElse { emptyList() }) { task ->

                Text(text = "Text: ${task.text}, Completed?: ${task.isCompleted}")

            }

        }

    }
    ```

11. Connect the app to your backend

    1. Get the deployment URL of your dev server with `cat .env.local | grep CONVEX_URL`
    2. Add a `client: ConvexClient` val and update `MainActivity.onCreate` to use the `@Composable` you just created.

    ```
    val client: ConvexClient by lazy { ConvexClient($YOUR_CONVEX_URL) }



    class MainActivity : ComponentActivity() {

      override fun onCreate(savedInstanceState: Bundle?) {

          super.onCreate(savedInstanceState)

          enableEdgeToEdge()

          setContent {

              ConvexQuickstartTheme {

                  Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->

                      Tasks(

                          modifier = Modifier.padding(innerPadding)

                      )

                  }

              }

          }

      }

    }
    ```

12. Fix any missing imports

    Fix up any missing imports (your import declarations should look something like this):

    ```
    import android.os.Bundle

    import androidx.activity.ComponentActivity

    import androidx.activity.compose.setContent

    import androidx.activity.enableEdgeToEdge

    import androidx.compose.foundation.layout.fillMaxSize

    import androidx.compose.foundation.layout.padding

    import androidx.compose.foundation.lazy.LazyColumn

    import androidx.compose.foundation.lazy.items

    import androidx.compose.material3.Scaffold

    import androidx.compose.material3.Text

    import androidx.compose.runtime.Composable

    import androidx.compose.runtime.LaunchedEffect

    import androidx.compose.runtime.getValue

    import androidx.compose.runtime.mutableStateOf

    import androidx.compose.runtime.remember

    import androidx.compose.runtime.setValue

    import androidx.compose.ui.Modifier

    import dev.convex.android.ConvexClient

    import kotlinx.serialization.Serializable
    ```

13. Run the app

    You can also try adding, updating or deleting documents in your `tasks` table at `dashboard.convex.dev` - the app will update with the changes in real-time.

    ```
    From the IDE menu choose "Run" > "Run 'app'"
    ```

See the complete [Android Kotlin documentation](/client/android/overview.md).
