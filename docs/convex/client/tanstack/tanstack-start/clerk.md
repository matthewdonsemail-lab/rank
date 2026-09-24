# TanStack Start with Clerk

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Using Clerk with Convex looks like following the [Clerk TanStack Quickstart](https://clerk.com/docs/quickstarts/tanstack-start) and adding Convex like the [Convex TanStack Quickstart](/quickstart/tanstack-start.md) shows. Then to make Clerk identity tokens available everywhere you might make authenticated calls to Convex in TanStack Start, you'll want to

1. Get an ID token from Clerk using `auth()` from `@clerk/tanstack-react-start/server` with `const token = await getToken()`.
2. Set the token in beforeLoad with `ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)` so the token will be available in loaders.
3. Add `<ConvexProviderWithClerk>` to the root component to keep refreshing Clerk tokens while the app is in use.

Making these changes looks like modifying `src/router.tsx` like this:

src/router.tsx

```
import { createRouter as createTanStackRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

import { DefaultCatchBoundary } from './components/DefaultCatchBoundary'

import { NotFound } from './components/NotFound'

import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

import { ConvexProvider, ConvexReactClient } from 'convex/react'

import { ConvexQueryClient } from '@convex-dev/react-query'

import { QueryClient } from '@tanstack/react-query'



export function getRouter() {

  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!

  if (!CONVEX_URL) {

    throw new Error('missing VITE_CONVEX_URL envar')

  }

  const convex = new ConvexReactClient(CONVEX_URL, {

    unsavedChangesWarning: false,

  })

  const convexQueryClient = new ConvexQueryClient(convex)



  const queryClient: QueryClient = new QueryClient({

    defaultOptions: {

      queries: {

        queryKeyHashFn: convexQueryClient.hashFn(),

        queryFn: convexQueryClient.queryFn(),

      },

    },

  })

  convexQueryClient.connect(queryClient)



  const router = createTanStackRouter({

    routeTree,

    defaultPreload: 'intent',

    defaultErrorComponent: DefaultCatchBoundary,

    defaultNotFoundComponent: () => <NotFound />,

    context: { queryClient, convexClient: convex, convexQueryClient },

    scrollRestoration: true,

    Wrap: ({ children }) => (

      <ConvexProvider client={convexQueryClient.convexClient}>

        {children}

      </ConvexProvider>

    ),

  })

  setupRouterSsrQueryIntegration({ router, queryClient })



  return router

}



declare module '@tanstack/react-router' {

  interface Register {

    router: ReturnType<typeof getRouter>

  }

}
```

and modifying `src/routes/__root.tsx` like this:

src/routes/\_\_root.tsx

```
import {

  HeadContent,

  Link,

  Outlet,

  Scripts,

  createRootRouteWithContext,

  useRouteContext,

} from '@tanstack/react-router'

import {

  ClerkProvider,

  Show,

  SignInButton,

  UserButton,

  useAuth,

} from '@clerk/tanstack-react-start'

import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { createServerFn } from '@tanstack/react-start'

import { QueryClient } from '@tanstack/react-query'

import * as React from 'react'

import { auth } from '@clerk/tanstack-react-start/server'

import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary.js'

import { NotFound } from '~/components/NotFound.js'

import appCss from '~/styles/app.css?url'

import { ConvexQueryClient } from '@convex-dev/react-query'



import { ConvexReactClient } from 'convex/react'

import { ConvexProviderWithClerk } from 'convex/react-clerk'



const fetchClerkAuth = createServerFn({ method: 'GET' }).handler(async () => {

  const { userId, getToken } = await auth()

  const token = await getToken()



  return {

    userId,

    token,

  }

})



export const Route = createRootRouteWithContext<{

  queryClient: QueryClient

  convexClient: ConvexReactClient

  convexQueryClient: ConvexQueryClient<ConvexReactClient>

}>()({

  head: () => ({

    meta: [

      {

        charSet: 'utf-8',

      },

      {

        name: 'viewport',

        content: 'width=device-width, initial-scale=1',

      },

    ],

    links: [

      { rel: 'stylesheet', href: appCss },

      {

        rel: 'apple-touch-icon',

        sizes: '180x180',

        href: '/apple-touch-icon.png',

      },

      {

        rel: 'icon',

        type: 'image/png',

        sizes: '32x32',

        href: '/favicon-32x32.png',

      },

      {

        rel: 'icon',

        type: 'image/png',

        sizes: '16x16',

        href: '/favicon-16x16.png',

      },

      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },

      { rel: 'icon', href: '/favicon.ico' },

    ],

  }),

  beforeLoad: async (ctx) => {

    const { userId, token } = await fetchClerkAuth()



    // During SSR only (the only time serverHttpClient exists),

    // set the Clerk auth token to make HTTP queries with.

    if (token) {

      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)

    }



    return {

      userId,

      token,

    }

  },

  errorComponent: (props) => {

    return (

      <RootDocument>

        <DefaultCatchBoundary {...props} />

      </RootDocument>

    )

  },

  notFoundComponent: () => <NotFound />,

  component: RootComponent,

})



function RootComponent() {

  const context = useRouteContext({ from: Route.id })

  return (

    <ClerkProvider>

      <ConvexProviderWithClerk client={context.convexClient} useAuth={useAuth}>

        <RootDocument>

          <Outlet />

        </RootDocument>

      </ConvexProviderWithClerk>

    </ClerkProvider>

  )

}



function RootDocument({ children }: { children: React.ReactNode }) {

  return (

    <html>

      <head>

        <HeadContent />

      </head>

      <body>

        <div className="p-2 flex gap-2 text-lg">

          <Link

            to="/"

            activeProps={{

              className: 'font-bold',

            }}

            activeOptions={{ exact: true }}

          >

            Home

          </Link>{' '}

          <Link

            to="/posts"

            activeProps={{

              className: 'font-bold',

            }}

          >

            Posts

          </Link>

          <div className="ml-auto">

            <Show when="signed-in">

              <UserButton />

            </Show>

            <Show when="signed-out">

              <SignInButton mode="modal" />

            </Show>

          </div>

        </div>

        <hr />

        {children}

        <TanStackRouterDevtools position="bottom-right" />

        <Scripts />

      </body>

    </html>

  )

}
```

Now all queries, mutations, and actions made with [TanStack Query](/client/tanstack/tanstack-query/.md) will be authenticated by a Clerk identity token.
