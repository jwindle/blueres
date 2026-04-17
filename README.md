# BlueRes

Store your résumé on your own [Bluesky](https://bsky.app) PDS using the AT Protocol.

## What it does

BlueRes lets you own your résumé data the same way you own your Bluesky posts — stored on your Personal Data Server, portable, and under your control.

- **Edit** your résumé through a minimal web editor that writes records directly to your PDS via AT Protocol OAuth
- **View** any BlueRes résumé at `/resume/[handle]`
- **Export** as standard [JSON Résumé](https://jsonresume.org) format at `/json/[handle]`

## Schema

Résumé data is stored as a collection of AT Protocol lexicon records under the `org.blueres.resume.*` namespace, closely following the [JSON Résumé schema](https://jsonresume.org/schema) with one addition: fields like `did` on work, education, volunteer, publication, reference, and project records allow linking to the Bluesky accounts of employers, institutions, and collaborators.

The full JSON Schema (compatible with JSON Résumé tooling) is in [`blueres-schema.json`](./blueres-schema.json).

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [AT Protocol](https://atproto.com) / [@atproto/oauth-client-node](https://github.com/bluesky-social/atproto)
- [Tailwind CSS](https://tailwindcss.com)
