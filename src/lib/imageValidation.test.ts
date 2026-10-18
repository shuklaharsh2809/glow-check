import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_BYTES, validateImageFile } from './imageValidation';
describe('image validation',()=>{
  it('accepts supported images',()=>expect(validateImageFile(new File(['x'],'a.jpg',{type:'image/jpeg'}))).toBeNull());
  it('rejects unsupported and empty files',()=>{expect(validateImageFile(new File(['x'],'a.gif',{type:'image/gif'}))).toMatch(/JPEG/);expect(validateImageFile(new File([],'a.png',{type:'image/png'}))).toMatch(/empty/);});
  it('rejects oversized files',()=>expect(validateImageFile(new File([new Uint8Array(MAX_IMAGE_BYTES+1)],'a.png',{type:'image/png'}))).toMatch(/10 MB/));
});
