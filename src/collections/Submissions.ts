import type { CollectionConfig } from 'payload'
import { encrypt, decrypt } from '../lib/encryption'

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  admin: {
    useAsTitle: 'email',
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.notes && typeof data.notes === 'string') {
          // Only encrypt plaintext — never re-encrypt an already-encrypted value.
          // The flag _notesEncrypted guards against double-encryption on update.
          data.notes = encrypt(data.notes)
        }
        return data
      },
    ],
    afterRead: [
      ({ doc }) => {
        if (doc.notes && typeof doc.notes === 'string') {
          doc.notes = decrypt(doc.notes)
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'quiz',
      type: 'relationship',
      relationTo: 'quizzes',
      required: true,
    },
    {
      name: 'score',
      type: 'number',
      required: true,
    },
    {
      name: 'result',
      type: 'text',
      required: true,
    },
    {
      name: 'breakdown',
      type: 'json',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
