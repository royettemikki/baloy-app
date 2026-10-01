'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createElectionAction } from '@/app/actions/elections';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import DurationInput from './DurationInput';

export default function NewElectionForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [filingDurationHours, setFilingDurationHours] = useState(168);
  const [votingDurationHours, setVotingDurationHours] = useState(120);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createElectionAction(title, filingDurationHours, votingDurationHours);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setTitle('');
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="e.g. 2027 Board Election"
      />

      <DurationInput
        label="Filing period"
        helperText='The clock starts only once you click "Open for filing."'
        defaultAmount={1}
        defaultUnit="weeks"
        onChange={setFilingDurationHours}
      />

      <DurationInput
        label="Voting period"
        helperText='The clock starts only once you click "Start voting."'
        defaultAmount={5}
        defaultUnit="days"
        onChange={setVotingDurationHours}
      />

      {error && <p className="text-xs text-danger">{error}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? 'Creating…' : 'Create election'}
      </Button>
    </form>
  );
}
