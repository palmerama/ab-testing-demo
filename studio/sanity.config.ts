import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {fieldLevelExperiments} from '@sanity/personalization-plugin/growthbook'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'ab-testing-demo',
  title: 'A/B Testing Demo',

  projectId: 'zgg4eegm',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
    fieldLevelExperiments({
      fields: ['string'],
      environment: 'production',
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
