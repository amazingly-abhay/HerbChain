import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBatch } from '@/contexts/BatchContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, CheckCircle, Users, Activity } from 'lucide-react';
import StatsCard from '@/components/ui/StatsCard';
import BatchCard from '@/components/batch/BatchCard';
import { SUPPLY_CHAIN_STAGES, STAGE_COLORS } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { BatchEvent } from '@/lib/types';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';

export default function DashboardPage() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { batches } = useBatch();

  const totalBatches = batches.length;
  const activeBatches = batches.filter(b => b.currentStage !== 'retail').length;
  const completedBatches = batches.filter(b => b.currentStage === 'retail').length;
  const totalActors = 8;

  const batchesByStage = SUPPLY_CHAIN_STAGES.map(s => ({
    name: locale === 'hi' ? s.labelHi : s.label,
    count: batches.filter(b => b.currentStage === s.stage).length,
    color: STAGE_COLORS[s.stage]
  }));

  const recentBatches = [...batches].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3);

  const allEvents: (BatchEvent & { herbName: string })[] = [];
  batches.forEach(batch => {
    batch.events.forEach(event => {
      allEvents.push({ ...event, herbName: batch.herbName });
    });
  });
  const recentEvents = allEvents.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.welcome') || 'Welcome back'}, {user?.name || 'User'} 👋
        </h1>
        <p className="text-gray-500">
          {t('dashboard.subtitle') || 'Overview of your Ayurvedic herb supply chain operations.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Batches"
          value={totalBatches}
          icon={<Package className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <StatsCard
          title="Active In Transit"
          value={activeBatches}
          icon={<Activity className="w-6 h-6 text-amber-600" />}
          color="amber"
        />
        <StatsCard
          title="Completed & Retailed"
          value={completedBatches}
          icon={<CheckCircle className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
        <StatsCard
          title="Verified Actors"
          value={totalActors}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Batches by Stage</h3>
          </CardHeader>
          <CardContent className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchesByStage}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {batchesByStage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Stage Distribution</h3>
          </CardHeader>
          <CardContent className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={batchesByStage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {batchesByStage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Batches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentBatches.map(batch => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <Card>
            <CardContent className="p-4 space-y-4">
              {recentEvents.map(event => (
                <div key={event.id} className="flex items-start gap-3 text-sm pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-herb-green-500 mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {event.herbName} <span className="text-gray-500 font-normal">({event.stage})</span>
                    </p>
                    <p className="text-xs text-gray-500 truncate">{event.notes}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatDateTime(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
