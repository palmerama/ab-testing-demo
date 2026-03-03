import {GrowthBookTracking} from '@/lib/growthbookTracking'
import {configureServerSideGrowthBook} from '@/lib/growthbookServer'
import {client} from '@/sanity/client'
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

const {projectId, dataset} = client.config()
const urlFor = (source: SanityImageSource) =>
  projectId && dataset ? imageUrlBuilder({projectId, dataset}).image(source) : null

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
  await gb.setAttributes({
    id: cookieStore.get(GB_UUID_COOKIE)?.value || '',
  })

  // Evaluate the feature flag — returns the variant value
  const variation = gb.getFeatureValue(EXPERIMENT_FLAG, 'default')
  const trackingData = gb.getDeferredTrackingCalls()

  // Pass variant into Sanity query
  const queryParams = {
    slug,
    experiment: EXPERIMENT_FLAG,
    variant: variation,
  }

  const event = await client.fetch(EVENT_QUERY, queryParams)

  gb.destroy()

  if (!event) {
    notFound()
  }

  const {name, date, headline, image, details, eventType, doorsOpen, venue, tickets} = event

  const eventImageUrl = image ? urlFor(image)?.width(550).height(310).url() : null
  const eventDate = new Date(date).toDateString()
  const eventTime = new Date(date).toLocaleTimeString()
  const doorsOpenTime = new Date(
    new Date(date).getTime() - doorsOpen * 60000,
  ).toLocaleTimeString()

  return (
    <main className="container mx-auto grid gap-12 p-12">
      <div className="mb-4">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to events
        </Link>
      </div>
      <div className="grid items-start gap-12 sm:grid-cols-2">
        <Image
          src={eventImageUrl || 'https://placehold.co/550x310/png'}
          alt={name || 'Event'}
          className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
          height={310}
          width={550}
        />
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
              <dd className="font-semibold">Date</dd>
              <dt>{eventDate}</dt>
              <dd className="font-semibold">Time</dd>
              <dt>{eventTime}</dt>
              {doorsOpen > 0 && (
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
      <GrowthBookTracking data={trackingData} />
    </main>
  )
}
