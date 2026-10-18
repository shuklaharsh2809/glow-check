import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AnalysisResult } from '../features/analysis/analysis.types';
import { generateTips } from '../features/report/generateTips';
import { ReportPage } from './ReportPage';

const result: AnalysisResult = { faceDetected:true,faceCount:1,faceBoundingBox:{x:.2,y:.2,width:.4,height:.5},faceCenterX:.4,faceCenterY:.45,faceOccupancy:.2,headYawEstimate:null,headPitchEstimate:null,brightnessScore:55,sharpnessScore:75,framingScore:85,headPositionScore:null,photoPresentationScore:80 };

describe('premium report flow', () => {
  it('starts locked, opens the confirmation, and reveals tips after unlock', () => {
    const onUnlock = vi.fn();
    const { rerender } = render(<ReportPage name="Sam" result={result} tips={generateTips(result)} unlocked={false} onUnlock={onUnlock} onReset={vi.fn()} />);
    expect(screen.getAllByLabelText('Locked')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: /Unlock for/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent('No payment will be collected');
    fireEvent.click(screen.getByRole('button', { name: 'Unlock demo report' }));
    expect(onUnlock).toHaveBeenCalledOnce();
    rerender(<ReportPage name="Sam" result={result} tips={generateTips(result)} unlocked onUnlock={onUnlock} onReset={vi.fn()} />);
    expect(screen.queryByLabelText('Locked')).not.toBeInTheDocument();
    expect(screen.getByText(/No payment was made/)).toBeInTheDocument();
  });
});
