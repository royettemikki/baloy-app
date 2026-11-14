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
  const [termDurationYears, setTermDurationYears] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createElectionAction(
      title,
      filingDurationHours,
      votingDurationHours,
      termDurationYears,
    );
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

      <div>
        <label htmlFor="board-term-duration" className="mb-1.5 block text-xs font-medium text-ink">
          Board term
        </label>
        <div className="flex items-center gap-2">
          <input
            id="board-term-duration"
            type="number"
            min={1}
            max={20}
            step={1}
            value={termDurationYears}
            onChange={(event) => setTermDurationYears(Number(event.target.value))}
            required
            className="w-24 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink"
          />
          <span className="text-xs text-ink-muted">years from election close</span>
        </div>
        <p className="mt-1 text-[11px] text-ink-muted">
          Default is 2 years. Expired members remain as holdovers until elected successors take
          over.
        </p>
      </div>

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
