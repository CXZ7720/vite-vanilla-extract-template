import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/convert')({
  component: () => <div>Hello /convert!</div>
})
