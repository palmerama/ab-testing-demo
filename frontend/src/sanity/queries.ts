import {defineQuery} from 'next-sanity'

export const EVENTS_QUERY = defineQuery(`*[
  _type == "event"
  && defined(slug.current)
]{
  _id,
  name,
  slug,
  eventType,
  date,
  image,
  headline->{name},
  venue->{name, city}
} | order(date asc)`)

export const EVENT_QUERY = defineQuery(`*[
  _type == "event" && slug.current == $slug
][0]{
  ...,
  "name": coalesce(
    newName.variants[experimentId == $experiment && variantId == $variant][0].value,
    newName.default,
    name
  ),
  "date": coalesce(date, now()),
  "doorsOpen": coalesce(doorsOpen, 0),
  headline->,
  venue->
}`)
