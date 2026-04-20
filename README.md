# BlueRes

Store your résumé on your own [Bluesky](https://bsky.app) PDS using the AT Protocol.

Try it out at [res.blueres.org](https://res.blueres.org).

## What it does

BlueRes lets you own your résumé data the same way you own your Bluesky posts — stored on your Personal Data Server, portable, and under your control.

- **Edit** one or more résumés through a minimal web editor that writes records directly to your PDS via AT Protocol OAuth
- **Duplicate** any résumé to create a variant (e.g. a tailored version for a specific role)
- **Import** a [JSON Résumé](https://jsonresume.org) file to populate your résumé
- **View** a résumé at `/resume/[handle]/[rkey]`, or `/resume/[handle]` to see all of a user's résumés
- **Export** as JSON Résumé format at `/json/[handle]/[rkey]`, or `/json/[handle]` for the most recently created one

## Schema

Each résumé is stored as a single `org.blueres.resume.resume` AT Protocol record, so one user can hold multiple résumés on their PDS. The record structure follows the [JSON Résumé schema](https://jsonresume.org/schema) with two additions:

- A `did` field on work, education, volunteer, publication, reference, and project entries allows linking to the Bluesky accounts of employers, institutions, and collaborators
- A `meta.title` field names the résumé (e.g. "Software Engineer Resume") for use when a user has more than one

The full JSON Schema is in [`public/blueres-schema.json`](./public/blueres-schema.json). The AT Protocol lexicon is in [`lexicons/org/blueres/resume/resume.json`](./lexicons/org/blueres/resume/resume.json).

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [AT Protocol](https://atproto.com) / [@atproto/oauth-client-node](https://github.com/bluesky-social/atproto)
- [Tailwind CSS](https://tailwindcss.com)
