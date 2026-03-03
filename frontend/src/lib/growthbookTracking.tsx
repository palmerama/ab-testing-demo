'use client'

import type {TrackingCallback, TrackingData} from '@growthbook/growthbook'
import {useEffect} from 'react'

export const onExperimentView: TrackingCallback = (experiment, result) => {
  console.log('Viewed Experiment', {
    experimentId: experiment.key,
    variationId: result.key,
  })
}

export function GrowthBookTracking({data}: {data: TrackingData[]}) {
  useEffect(() => {
    data.forEach(({experiment, result}) => {
      onExperimentView(experiment, result)
    })
  }, [data])
  return null
}
