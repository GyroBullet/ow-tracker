'use client';
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SyncButton({ username }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    try {
      await fetch(`/api/player/${username}/sync`, { method: 'POST' });
      // Call router.refresh() to reload the Server Components
      router.refresh();
      
      // Artificial delay for better UX
      setTimeout(() => {
        setLoading(false);
      }, 700);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSync} 
      disabled={loading}
      className={`sync-btn ${loading ? 'loading' : ''}`}
    >
      <RefreshCw size={16} className={loading ? 'spin' : ''} />
      {loading ? 'Updating...' : 'Update Profile'}
    </button>
  );
}
