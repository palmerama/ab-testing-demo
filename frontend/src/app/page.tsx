import {client} from '@/sanity/client'
import {EVENTS_QUERY} from '@/sanity/queries'
import imageUrlBuilder from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url/lib/types/types'
import Image from 'next/image'
import Link from 'next/link'

const {projectId, dataset} = client.config()
const urlFor = (source: SanityImageSource) =>
  projectId && dataset ? imageUrlBuilder({projectId, dataset}).image(source) : null

export default async function HomePage() {
  const events = await client.fetch(EVENTS_QUERY)

  return (
    <main className="container mx-auto p-12">
      <h1 className="text-4xl font-bold mb-8">Upcoming Events</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event: any) => {
          const imageUrl = event.image
            ? urlFor(event.image)?.width(550).height(310).url()
            : null

          return (
            <Link
              key={event._id}
              href={`/events/${event.slug?.current}`}
              className="group block rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Image
                src={imageUrl || 'https://placehold.co/550x310/png'}
                alt={event.name || 'Event'}
                width={550}
                height={310}
                className="aspect-video object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                  {event.name}
                </h2>
                {event.headline?.name && (
                  <p className="text-gray-600 mt-1">{event.headline.name}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  {event.date && <span>{new Date(event.date).toLocaleDateString()}</span>}
                  {event.venue?.name && (
                    <>
                      <span>·</span>
                      <span>
                        {event.venue.name}
                        {event.venue.city ? `, ${event.venue.city}` : ''}
                      </span>
                    </>
                  )}
                </div>
                {event.eventType && (
                  <span className="inline-block mt-2 rounded-full bg-gray-100 px-3 py-1 text-xs capitalize">
                    {event.eventType.replace('-', ' ')}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
