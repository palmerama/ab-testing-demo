import {UserIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const artistType = defineType({
  name: 'artist',
  title: 'Artist',
  icon: UserIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'photo',
      type: 'image',
    }),
  ],
})
