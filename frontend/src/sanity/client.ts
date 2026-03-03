import {createClient} from 'next-sanity'

export const projectId = 'zgg4eegm'
export const dataset = 'production'
export const apiVersion = '2024-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})
