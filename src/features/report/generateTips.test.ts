import { describe, expect, it } from 'vitest';
import type { AnalysisResult } from '../analysis/analysis.types';
import { generateTips } from './generateTips';

const result: AnalysisResult={faceDetected:true,faceCount:1,faceBoundingBox:{x:.25,y:.2,width:.6,height:.7},faceCenterX:.55,faceCenterY:.55,faceOccupancy:.42,headYawEstimate:null,headPitchEstimate:null,brightnessScore:20,sharpnessScore:20,framingScore:55,headPositionScore:null,photoPresentationScore:45};
describe('recommendations',()=>{
  it('returns two free and three premium unique tips',()=>{const tips=generateTips(result);expect(tips.free).toHaveLength(2);expect(tips.premium).toHaveLength(3);expect(new Set([...tips.free,...tips.premium].map(t=>t.id)).size).toBe(5);expect(tips.free.every(t=>!t.premium)).toBe(true);});
  it('prefers evidence-backed tips',()=>expect(generateTips(result).free.map(t=>t.id)).toEqual(['soft-light','steady-shot']));
  it('is deterministic and labels fallback advice',()=>{expect(generateTips(result)).toEqual(generateTips({...result}));const neutral=generateTips({...result,brightnessScore:50,sharpnessScore:80,framingScore:90,faceOccupancy:.25});expect([...neutral.free,...neutral.premium].every(t=>t.isGeneral)).toBe(true);});
});
