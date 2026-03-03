import {setPolyfills, configureCache} from '@growthbook/growthbook'

export function configureServerSideGrowthBook() {
  setPolyfills({
    fetch: (url: Parameters<typeof fetch>[0], opts: Parameters<typeof fetch>[1]) =>
      fetch(url, {
        ...opts,
        next: {revalidate: 60, tags: ['growthbook']},
      } as RequestInit),
  })
  configureCache({disableCache: true})
}
