import { describe, expect, it } from 'vitest';
import { toContact } from '../contactsService';

describe('toContact', () => {
  it('maps a contact with its email', () => {
    expect(
      toContact({
        id: 'c-1',
        firstName: ' Sample ',
        lastName: 'Person',
        identities: [
          { type: 'PHONE', value: '000' },
          { type: 'EMAIL', value: 'sample@example.com' },
        ],
      })
    ).toEqual({ id: 'c-1', name: 'Sample Person', email: 'sample@example.com' });
  });

  it('drops records without an id or a name, and tolerates missing fields', () => {
    expect(toContact({ id: 'c-2' })).toBeNull();
    expect(toContact({ firstName: 'Sample' })).toBeNull();
    expect(toContact({ id: 'c-3', firstName: 'Sample', identities: null })).toEqual({
      id: 'c-3',
      name: 'Sample',
      email: null,
    });
    expect(toContact({ id: 42, firstName: { nested: true } })).toBeNull();
  });
});
