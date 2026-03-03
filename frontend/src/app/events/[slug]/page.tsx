import {GrowthBookTracking} from '@/lib/growthbookTracking'
import {configureServerSideGrowthBook} from '@/lib/growthbookServer'
import {client, projectId, dataset} from '@/sanity/client'
import {EVENT_QUERY} from '@/sanity/queries'
import {GrowthBook} from '@growthbook/growthbook'
import imageUrlBuilder from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url/lib/types/types'
import {PortableText} from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import {cookies} from 'next/headers'
import {notFound} from 'next/navigation'

const GB_UUID_COOKIE = 'gb-user-id'
const EXPERIMENT_FLAG = 'event-name'

const builder = imageUrlBuilder({projectId, dataset})
const urlFor = (source: SanityImageSource) => builder.image(source)

export default async function EventPage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const {slug} = await params

  // Configure GrowthBook for server-side rendering
  configureServerSideGrowthBook()

  const gb = new GrowthBook({
    clientKey: process.env.GROWTHBOOK_CLIENT_KEY,
    enableDevMode: true,
  })
  await gb.init({timeout: 1000})

  // Get user ID from cookie for consistent variant assignment
  const cookieStore = await cookies()
  const userId = cookieStore.get(GB_UUID_COOKIE)?.value || ''
  await gb.setAttributes({id: userId})

  // Evaluate the feature flag — returns the variant value
  const variation = gb.getFeatureValue(EXPERIMENT_FLAG, 'default')
  const trackingData = gb.getDeferredTrackingCalls()

  // Pass variant into Sanity query
  const event = await client.fetch(EVENT_QUERY, {
    slug,
    experiment: EXPERIMENT_FLAG,
    variant: variation,
  })

  gb.destroy()

  if (!event) {
    notFound()
  }

  const {name, date, headline, image, details, eventType, doorsOpen, venue, tickets} =
    event as any

  const eventImageUrl = image ? urlFor(image).width(550).height(310).url() : null
  const eventDate = date ? new Date(date).toDateString() : null
  const eventTime = date ? new Date(date).toLocaleTimeString() : null
  const doorsOpenTime =
    date && doorsOpen
      ? new Date(new Date(date).getTime() - doorsOpen * 60000).toLocaleTimeString()
      : null

  return (
    <main className="container mx-auto grid gap-12 p-12">
      <div>
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to events
        </Link>
      </div>
      <div className="grid items-start gap-12 sm:grid-cols-2">
        {eventImageUrl ? (
          <Image
            src={eventImageUrl}
            alt={name || 'Event'}
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
            height={310}
            width={550}
          />
        ) : (
          <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-4">
            {eventType && (
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm capitalize">
                {eventType.replace('-', ' ')}
              </div>
            )}
            {name && (
              <h1 className="text-4xl font-bold tracking-tighter mb-8">{name}</h1>
            )}
            <dl className="grid grid-cols-2 gap-1 text-sm sm:gap-2 lg:text-base">
              {headline?.name && (
                <>
                  <dd className="font-semibold">Artist</dd>
                  <dt>{headline.name}</dt>
                </>
              )}
              {eventDate && (
                <>
                  <dd className="font-semibold">Date</dd>
                  <dt>{eventDate}</dt>
                </>
              )}
              {eventTime && (
                <>
                  <dd className="font-semibold">Time</dd>
                  <dt>{eventTime}</dt>
                </>
              )}
              {doorsOpenTime && (
                <>
                  <dd className="font-semibold">Doors Open</dd>
                  <dt>{doorsOpenTime}</dt>
                </>
              )}
              {venue?.name && (
                <>
                  <dd className="font-semibold">Venue</dd>
                  <dt>
                    {venue.name}
                    {venue.city ? `, ${venue.city}` : ''}
                    {venue.country ? `, ${venue.country}` : ''}
                  </dt>
                </>
              )}
            </dl>
          </div>
          {details && details.length > 0 && (
            <div className="prose max-w-none">
              <PortableText value={details} />
            </div>
          )}
          {tickets && (
            <a
              className="flex items-center justify-center rounded-md bg-blue-500 p-4 text-white hover:bg-blue-600 transition-colors"
              href={tickets}
            >
              Buy Tickets
            </a>
          )}
        </div>
      </div>

      {/* Debug: A/B test info */}
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        <strong>A/B Test Debug:</strong> Experiment: <code>{EXPERIMENT_FLAG}</code> |
        Variant: <code>{variation}</code> |
        User: <code>{userId.slice(0, 8)}...</code>
      </div>

      <GrowthBookTracking data={trackingData} />
    </main>
  )
}
