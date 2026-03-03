import {GrowthBookTracking} from '@/lib/growthbookTracking'
import {configureServerSideGrowthBook} from '@/lib/growthbookServer'
import {client} from '@/sanity/client'
import {EVENT_QUERY} from '@/sanity/queries'
import {GrowthBook} from '@growthbook/growthbook'
import {cookies} from 'next/headers'
import {GB_UUID_COOKIE} from '@/middleware'
import imageUrlBuilder from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url/lib/types/types'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {PortableText} from 'next-sanity'

const EXPERIMENT_FLAG = 'event-name'

const {projectId, dataset} = client.config()
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({projectId, dataset}).image(source)
    : null

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

  const cookieStore = await cookies()
  await gb.setAttributes({
    id: cookieStore.get(GB_UUID_COOKIE)?.value || '',
  })

  // Evaluate the feature flag — returns the variant string
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

  const {name, date, headline, image, details, eventType, doorsOpen, venue, tickets} =
    event as any

  const eventImageUrl = image ? urlFor(image)?.width(550).height(310).url() : null
  const eventDate = date ? new Date(date).toDateString() : null
  const eventTime = date ? new Date(date).toLocaleTimeString() : null
  const doorsOpenTime =
    date && doorsOpen
      ? new Date(new Date(date).getTime() - doorsOpen * 60000).toLocaleTimeString()
      : null

  return (
    <main className="container mx-auto grid gap-12 p-12">
      <div className="mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
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
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm capitalize dark:bg-gray-800">
                {eventType.replace('-', ' ')}
              </div>
            )}
            {name && (
              <h1 className="text-4xl font-bold tracking-tighter">{name}</h1>
            )}
            <dl className="grid grid-cols-2 gap-1 text-sm font-medium sm:gap-2 lg:text-base">
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
            <div className="prose max-w-none dark:prose-invert">
              <PortableText value={details} />
            </div>
          )}
          {tickets && (
            <a
              className="flex items-center justify-center rounded-md bg-blue-500 p-4 text-white hover:bg-blue-600"
              href={tickets}
            >
              Buy Tickets
            </a>
          )}
        </div>
      </div>

      {/* Debug: show which variant is being served */}
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        <p>
          <strong>A/B Test Debug:</strong> Experiment: <code>{EXPERIMENT_FLAG}</code> |
          Variant: <code>{variation}</code> |
          User ID: <code>{cookieStore.get(GB_UUID_COOKIE)?.value || 'none'}</code>
        </p>
      </div>

      <GrowthBookTracking data={trackingData} />
    </main>
  )
}
