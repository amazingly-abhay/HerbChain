import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Brain, Link as LinkIcon, QrCode, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import { SUPPLY_CHAIN_STAGES } from '@/lib/constants';

export default function LandingPage() {
  const { t, locale, setLocale } = useLanguage();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: locale === 'en' ? 'End-to-End Traceability' : 'पूर्ण पता लगाने योग्यता',
      description: locale === 'en' ? 'Track every herb from collection to retail' : 'संग्रहण से लेकर खुदरा तक प्रत्येक जड़ी बूटी को ट्रैक करें',
      color: 'bg-green-500'
    },
    {
      icon: <Brain className="w-8 h-8 text-white" />,
      title: locale === 'en' ? 'AI Plant Analysis' : 'AI पौधा विश्लेषण',
      description: locale === 'en' ? 'Automated health assessment and identification' : 'स्वचालित स्वास्थ्य मूल्यांकन और पहचान',
      color: 'bg-blue-500'
    },
    {
      icon: <LinkIcon className="w-8 h-8 text-white" />,
      title: locale === 'en' ? 'Blockchain Security' : 'ब्लॉकचेन सुरक्षा',
      description: locale === 'en' ? 'Immutable records on distributed ledger' : 'वितरित लेजर पर अपरिवर्तनीय रिकॉर्ड',
      color: 'bg-purple-500'
    },
    {
      icon: <QrCode className="w-8 h-8 text-white" />,
      title: locale === 'en' ? 'QR Verification' : 'QR सत्यापन',
      description: locale === 'en' ? 'Scan to verify authenticity instantly' : 'प्रामाणिकता तुरंत सत्यापित करने के लिए स्कैन करें',
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="min-h-screen bg-herb-cream font-sans">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-herb-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            🌿
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">HerbChain</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLocale(locale === 'en' ? 'hi' : 'en')}
            className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {locale === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <Button variant="ghost" onClick={() => navigate('/login')}>
            {t('nav.login') || 'Log In'}
          </Button>
          <Button variant="primary" onClick={() => navigate('/register')}>
            {t('nav.register') || 'Get Started'}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6 gradient-green text-white">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight"
          >
            {locale === 'en' ? 'Transparent Ayurvedic Supply Chain' : 'पारदर्शी आयुर्वेदिक आपूर्ति श्रृंखला'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-herb-green-100 max-w-3xl mx-auto"
          >
            {locale === 'en' 
              ? 'Combining immutable event logging, AI-driven plant assessment, and public QR verification to track Ayurvedic herb batches from farm to shelf.'
              : 'संग्रहण से लेकर शेल्फ तक आयुर्वेदिक जड़ी-बूटियों के बैच को ट्रैक करने के लिए ब्लॉकचेन और एआई का संयोजन।'}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" onClick={() => navigate('/verify')}>
              Verify Batch Product
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Key Platform Capabilities</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Full-stack traceability prototype solving fragmented record-keeping across the Ayurvedic supply chain.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <Card key={i} className="p-6">
              <CardContent className="space-y-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">Five Lifecycle Stages</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Every batch moves through strict verifiable checkpoints recorded on-chain.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {SUPPLY_CHAIN_STAGES.map((s, index) => (
              <div key={s.stage} className="flex flex-col items-center text-center space-y-3">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md"
                  style={{ backgroundColor: s.color }}
                >
                  {index + 1}
                </div>
                <h4 className="text-lg font-bold text-gray-900">{locale === 'hi' ? s.labelHi : s.label}</h4>
                <p className="text-xs text-gray-500">
                  {s.stage === 'collection' && 'Harvested with GPS capture'}
                  {s.stage === 'processing' && 'Cleaned, dried & processed'}
                  {s.stage === 'testing' && 'Quality & AI assessment'}
                  {s.stage === 'shipment' && 'Tracked distribution'}
                  {s.stage === 'retail' && 'Public QR verification'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>© 2026 HerbChain Traceability Prototype. Built for Ayurvedic Supply Chain Integrity.</p>
      </footer>
    </div>
  );
}
