import {defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons'

export const venueType = defineType({
  name: 'venue',
  title: 'Venue',
  icon: PinIcon,
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string'}),
    defineField({name: 'city', type: 'string'}),
    defineField({name: 'country', type: 'string'}),
  ],
})
