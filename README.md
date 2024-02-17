# BMLT Data Converter

- Converts BMLT data from JSON to CSV or KML
  - Note that export of KML is only supported with GetSearchResults.
- Use your semantic interface to build query url

## Developing

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Deploying

New deploys are done with every push to the main branch. You can deploy one manually by running:

```bash
npm run deploy
```
