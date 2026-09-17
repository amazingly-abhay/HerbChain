import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CreateBatchForm from '@/components/batch/CreateBatchForm';

export default function CreateBatchPage() {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/batches');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={handleCancel}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Batch</h1>
          <p className="text-gray-500">Initiate a new herb batch in the supply chain</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <CreateBatchForm />
      </div>
    </div>
  );
}
