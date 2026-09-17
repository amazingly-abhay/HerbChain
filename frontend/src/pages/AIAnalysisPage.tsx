import React from 'react';
import { Brain, Camera, Scan, Leaf } from 'lucide-react';
import PlantAnalysis from '@/components/ai/PlantAnalysis';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';

export default function AIAnalysisPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center p-4 bg-herb-green-100 text-herb-green-700 rounded-full mb-2">
          <Brain size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">AI Plant Analysis</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload images of herbs or plant material for automated identification, 
          health assessment, and disease detection using our advanced AI model.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6">
          <PlantAnalysis />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Camera size={24} />
            </div>
            <h3 className="font-semibold text-lg">Clear Photos</h3>
            <p className="text-sm text-gray-500">Ensure good lighting and focus on the leaves or affected areas for best results.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <Scan size={24} />
            </div>
            <h3 className="font-semibold text-lg">Instant Results</h3>
            <p className="text-sm text-gray-500">Get immediate feedback on plant species, confidence score, and potential diseases.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Leaf size={24} />
            </div>
            <h3 className="font-semibold text-lg">Quality Assurance</h3>
            <p className="text-sm text-gray-500">Use analysis reports to verify quality standards before accepting batches.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
