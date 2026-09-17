import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Heart,
  Bug,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AIAnalysis } from '@/lib/types';
import { fileToBase64 } from '@/lib/utils';
import { aiApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import FileUpload from '@/components/ui/FileUpload';

interface PlantAnalysisProps {
  onSaveAnalysis?: (analysis: AIAnalysis) => void;
  initialImage?: string;
}

export default function PlantAnalysis({ onSaveAnalysis, initialImage }: PlantAnalysisProps) {
  const { t } = useLanguage();
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  const handleFileSelect = async (file: File) => {
    const base64 = await fileToBase64(file);
    setImage(base64);
    setImageFile(file);
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const liveAnalysis = await aiApi.analyzePlant(imageFile);
      setAnalysis(liveAnalysis);
      onSaveAnalysis?.(liveAnalysis);
    } catch (error) {
      console.error('Plant analysis failed', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setAnalysis(null);
  };

  const getHealthColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBg = (rating: number) => {
    if (rating >= 8) return 'from-green-400 to-green-600';
    if (rating >= 5) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-100 text-red-800';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept="image/*"
                preview={image}
                label={t('ai.uploadImage') || 'Upload Plant Image'}
              />
            </div>
            <div className="flex flex-col justify-center items-center text-center space-y-4">
              <Sparkles className="w-12 h-12 text-herb-amber-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t('ai.title') || 'AI Plant Analysis'}
              </h3>
              <p className="text-sm text-gray-600 max-w-xs">
                {t('ai.subtitle') || 'Upload a photo of an Ayurvedic plant for AI-powered identification, health assessment, and harvest readiness analysis.'}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleAnalyze}
                  disabled={!image}
                  isLoading={isAnalyzing}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  {isAnalyzing ? (t('ai.analyzing') || 'Analyzing...') : 'Analyze Plant'}
                </Button>
                {image && (
                  <Button variant="ghost" onClick={handleReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analyzing Animation */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-4 border-herb-green-200 border-t-herb-green-600"
            />
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-4 text-herb-green-700 font-medium"
            >
              Analyzing plant image with AI...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {analysis && !isAnalyzing && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-4"
          >
            {/* Plant Identification */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-herb-green-600" />
                    <h4 className="font-semibold text-gray-900">
                      {t('ai.plantId') || 'Plant Identification'}
                    </h4>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <p className="text-lg font-bold text-gray-900">{analysis.plantIdentification.name}</p>
                  <p className="text-sm text-gray-500 italic">{analysis.plantIdentification.scientificName}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{t('ai.confidence') || 'Confidence'}</span>
                      <span className="font-medium">{(analysis.plantIdentification.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.plantIdentification.confidence * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="bg-herb-green-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Health Rating */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <h4 className="font-semibold text-gray-900">
                      {t('ai.healthRating') || 'Health Rating'}
                    </h4>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 flex items-center gap-6">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                      />
                      <motion.path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#healthGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: '0 100' }}
                        animate={{ strokeDasharray: `${analysis.healthRating * 10} 100` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                      />
                      <defs>
                        <linearGradient id="healthGradient">
                          <stop offset="0%" className={getHealthBg(analysis.healthRating).includes('green') ? 'text-green-400' : 'text-yellow-400'} stopColor="currentColor" />
                          <stop offset="100%" className={getHealthBg(analysis.healthRating).includes('green') ? 'text-green-600' : 'text-yellow-600'} stopColor="currentColor" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xl font-bold ${getHealthColor(analysis.healthRating)}`}>
                        {analysis.healthRating}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">out of 10</p>
                    <p className={`font-semibold ${getHealthColor(analysis.healthRating)}`}>
                      {analysis.healthRating >= 8 ? 'Excellent' : analysis.healthRating >= 5 ? 'Fair' : 'Poor'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Diseases */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <h4 className="font-semibold text-gray-900">
                      {t('ai.diseases') || 'Diseases'}
                    </h4>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {analysis.diseases.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('ai.noIssues') || 'No diseases detected'}</span>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {analysis.diseases.map((disease, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{disease.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityColor(disease.severity)}`}>
                            {disease.severity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Pests */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Bug className="w-5 h-5 text-orange-500" />
                    <h4 className="font-semibold text-gray-900">
                      {t('ai.pests') || 'Pests'}
                    </h4>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {analysis.pests.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">No pests detected</span>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {analysis.pests.map((pest, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{pest.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityColor(pest.severity)}`}>
                            {pest.severity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Harvest Readiness */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900">
                      {t('ai.harvestReadiness') || 'Harvest Readiness'}
                    </h4>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="flex items-center gap-3">
                    {analysis.harvestReadiness.ready ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <div>
                          <p className="font-semibold text-green-700">{t('ai.ready') || 'Ready for Harvest'}</p>
                          <p className="text-sm text-gray-600">{analysis.harvestReadiness.notes}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Clock className="w-8 h-8 text-yellow-500" />
                        <div>
                          <p className="font-semibold text-yellow-700">{t('ai.notReady') || 'Not Ready Yet'}</p>
                          {analysis.harvestReadiness.estimatedDays && (
                            <p className="text-sm text-gray-600">
                              ~{analysis.harvestReadiness.estimatedDays} {t('ai.estimatedDays') || 'days remaining'}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">{analysis.harvestReadiness.notes}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recommendations */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-herb-amber-500" />
                    <h4 className="font-semibold text-gray-900">
                      {t('ai.recommendations') || 'Recommendations'}
                    </h4>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Leaf className="w-4 h-4 text-herb-green-500 mt-0.5 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Save Button */}
            {onSaveAnalysis && (
              <motion.div variants={itemVariants} className="md:col-span-2 flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => onSaveAnalysis(analysis)}
                  leftIcon={<CheckCircle className="w-5 h-5" />}
                >
                  {t('ai.saveToBatch') || 'Save Analysis to Batch'}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
