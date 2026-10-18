import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { generateReport } from '../features/report/generateReport';
import { canonicalLandmarks, resultFromLandmarks } from '../test/faceFixture';
import { ReportPage } from './ReportPage';

const result = resultFromLandmarks(canonicalLandmarks(), { skin: { clarity: 60, evenness: 70, underEye: 65, score: 64 } });
const report = generateReport(result, 26);

describe('premium report flow', () => {
  it('shows strengths and the free plan, then reveals locked content after the demo unlock', () => {
    const onUnlock = vi.fn();
    const props = { name: 'Sam', result, report, imageUrl: 'blob:portrait', onUnlock, onReset: vi.fn() };
    const { rerender } = render(<ReportPage {...props} unlocked={false} />);
    expect(screen.getByRole('heading', { name: /What makes your face attractive/ })).toBeInTheDocument();
    expect(screen.getByText('High facial symmetry')).toBeInTheDocument();
    expect(screen.getByLabelText(/Harmony score: \d+ out of 100/)).toBeInTheDocument();
    // Six locked measurements, every premium plan item, and the routine.
    expect(screen.getAllByLabelText('Locked')).toHaveLength(6 + report.premium.length + 1);

    fireEvent.click(screen.getByRole('button', { name: /Unlock for/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent('No payment will be collected');
    fireEvent.click(screen.getByRole('button', { name: 'Unlock demo report' }));
    expect(onUnlock).toHaveBeenCalledOnce();

    rerender(<ReportPage {...props} unlocked />);
    expect(screen.queryByLabelText('Locked')).not.toBeInTheDocument();
    expect(screen.getByText(/No payment was made/)).toBeInTheDocument();
    expect(screen.getByText('Your daily glow routine')).toBeInTheDocument();
  });

  it('toggles the measurement guides over the portrait', () => {
    render(<ReportPage name="Sam" result={result} report={report} imageUrl="blob:portrait" unlocked={false} onUnlock={vi.fn()} onReset={vi.fn()} />);
    const toggle = screen.getByRole('button', { name: /Hide guides/ });
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: /Show guides/ })).toHaveAttribute('aria-pressed', 'false');
  });
});
