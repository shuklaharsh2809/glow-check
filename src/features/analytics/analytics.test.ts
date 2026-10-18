import { afterEach, describe, expect, it, vi } from 'vitest';
describe('analytics privacy boundary',()=>{
  afterEach(()=>vi.restoreAllMocks());
  it('emits nothing before consent',async()=>{const log=vi.spyOn(console,'info').mockImplementation(()=>{});const {trackEvent}=await import('./analytics');trackEvent('photo_selected',{source:'upload'});expect(log).not.toHaveBeenCalled();});
  it('drops properties outside the safe schema',async()=>{vi.resetModules();const log=vi.spyOn(console,'info').mockImplementation(()=>{});const api=await import('./analytics');await api.setAnalyticsConsent(true);api.trackEvent('photo_selected',{source:'upload',name:'private'});expect(log).toHaveBeenCalledWith('[analytics] photo_selected',{source:'upload'});});
});
