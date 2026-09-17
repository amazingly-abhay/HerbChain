import { AIAnalysis } from '@/lib/types';

export const mockAnalyses: AIAnalysis[] = [
  {
    plantIdentification: {
      name: 'Ashwagandha',
      scientificName: 'Withania somnifera',
      confidence: 0.98
    },
    healthRating: 8.5,
    diseases: [],
    pests: [],
    harvestReadiness: {
      ready: true,
      estimatedDays: 0,
      notes: 'Plant is healthy and fully mature.'
    },
    recommendations: [
      'Plant is healthy and ready for harvest.',
      'Ensure roots are carefully extracted to maintain quality.'
    ]
  },
  {
    plantIdentification: {
      name: 'Tulsi',
      scientificName: 'Ocimum sanctum',
      confidence: 0.95
    },
    healthRating: 6.2,
    diseases: [
      { name: 'Leaf Spot', severity: 'low', confidence: 0.82 }
    ],
    pests: [
      { name: 'Aphids', severity: 'low', confidence: 0.78 }
    ],
    harvestReadiness: {
      ready: false,
      estimatedDays: 5,
      notes: 'Requires 5 more days of growth before harvest.'
    },
    recommendations: [
      'Apply organic neem oil spray for aphids.',
      'Ensure proper sunlight and water drainage.'
    ]
  }
];
