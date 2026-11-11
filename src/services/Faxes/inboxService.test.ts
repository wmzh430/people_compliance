import { describe, expect, it } from 'vitest';
import { buildActionLogPayload } from './inboxService';

describe('buildActionLogPayload', () => {
  it('builds fax payloads for regular fax documents', () => {
    expect(buildActionLogPayload({ fax_id: 123 }, 'Download')).toEqual({
      fax_id: 123,
      action: 'Download'
    });
  });

  it('builds referral payloads with document_id and source', () => {
    expect(
      buildActionLogPayload({ id: 456, source: 'portal' }, 'Share', {
        isReferrals: true
      })
    ).toEqual({
      document_id: 456,
      source: 'portal',
      action: 'Share'
    });
  });

  it('skips report audit logging', () => {
    expect(buildActionLogPayload({ id: 789 }, 'Print', { isReports: true })).toBeNull();
  });

  it('returns null when the target identifier is missing', () => {
    expect(buildActionLogPayload({}, 'Print', { isReferrals: true })).toBeNull();
    expect(buildActionLogPayload({}, 'Print')).toBeNull();
  });
});
