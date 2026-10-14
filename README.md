# Retern

A responsive doorstep-return platform with customer, driver and merchant profiles. Built with HTML-rendered React, Vinext and a Cloudflare D1 backend through Sites.

## Account workflows

Sign in with ChatGPT. Choose one account type when registering; existing account types cannot be changed through the API.

- Customers save a pickup address, request prepared prepaid-label returns, track progress and cancel unclaimed requests.
- Drivers browse requests by displayed ZIP code, claim pickups, view pickup contact details after claiming, and confirm pickup and carrier drop-off.
- Merchants register their business, view returns explicitly linked to their account, and confirm receipt after carrier drop-off.

Addresses and pickup notes are hidden from other drivers and merchants. Every operation checks the authenticated identity and account role. Status changes use conditional updates to prevent double claims. Records are stored in D1, not browser storage.

## Launch boundaries

This is initially an owner-private Site. Public access and retern.app custom-domain configuration have not been enabled. The advertised starting price is $19.95 per month. Checkout, subscriptions, driver earnings, payouts, carrier integrations and employer permissions require configuration before commercial launch. The platform does not imply affiliation with any carrier, guaranteed pickup availability or merchant refunds.

The hero image was generated using the built-in image tool with this brief: open shipping box and sage delivery bag, knitting yarn, makeup, gardening tools, headphones and musical notes; warm editorial lifestyle photography without text. The project asset is public/images/retern-hero.png.

## Validation

- `node tests/platform.mjs` checks the real API handler against an in-memory database adapter for authentication, role boundaries, request isolation, private address access, transition permissions and the full return lifecycle.
- `./node_modules/.bin/tsc --noEmit` verifies types.
- Sites build helper produces the Worker archive. Drizzle migration creates profiles, returns and return_events.

Browser QA was unavailable in the managed environment. Authentication and hosted D1 require hosted runtime access for full end-to-end verification.
