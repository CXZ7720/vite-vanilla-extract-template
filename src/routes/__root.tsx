import { createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Home } from '../Home'
import "@mantine/core/styles.css";
import { MantineProvider } from '@mantine/core'
import { theme } from '../theme'

interface MyRouterContext {
  user: string
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
        <MantineProvider theme={theme}>
            <Home />
        </MantineProvider>
        <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent: () => {
    return <p>FFMPEG WASM</p>
  },
})
