import { createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Home } from '../Home'
import "@mantine/core/styles.css";
import { MantineProvider } from '@mantine/core'
import { theme } from '../theme'

export const Route = createRootRoute({
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
