import {client} from '@/sanity/client'
import {EVENTS_QUERY} from '@/sanity/queries'
import imageUrlBuilder from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url/lib/types/types'
import Image from 'next/image'
import Link from 'next/link'

const {projectId, dataset} = client.config()
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({projectId, dataset}).image(source)
    : null

export default async function HomePage() {
  const events = await client.fetch(EVENTS_QUERY)

  return (
    <main className="container mx-auto grid gap-12 p-12">
      <h1 className="text-4xl font-bold tracking-tighter">Events</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event: any) => {
          const eventImageUrl = event.image
            ? urlFor(event.image)?.width(550).height(310).url()
            : null

          return (
            <Link
              key={event._id}
              href={`/${event.slug?.current}`}
              className="group rounded-xl border border-gray-200 p-4 transition-colors hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-600"
            >
              <Image
                src={eventImageUrl || 'https://placehold.co/550x310/png'}
                alt={event.name || 'Event'}
                className="aspect-video w-full rounded-lg object-cover"
                height={310}
                width={550}
              />
              <div className="mt-4 space-y-2">
                {event.eventType && (
                  <span className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-xs capitalize dark:bg-gray-800">
                    {event.eventType.replace('-', ' ')}
                  </span>
                )}
                <h2 className="text-xl font-semibold group-hover:underline">
                  {event.name}
                </h2>
                {event.date && (
                  <p className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {event.headline?.name && <span>{event.headline.name}</span>}
                  {event.headline?.name && event.venue?.name && <span>·</span>}
                  {event.venue?.name && (
                    <span>
                      {event.venue.name}
                      {event.venue.city ? `, ${event.venue.city}` : ''}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
