![Tests](https://github.com/jwensley2/DownloadStatusBar/workflows/Test/badge.svg?branch=master)
[![Test Coverage](https://api.codeclimate.com/v1/badges/80b0cfb4b6831e7243dc/test_coverage)](https://codeclimate.com/github/jwensley2/DownloadStatusBar/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/80b0cfb4b6831e7243dc/maintainability)](https://codeclimate.com/github/jwensley2/DownloadStatusBar/maintainability)

# DownloadStatusBar

## Localization
To add translations for a new language copy [\_locales/en_CA/messages.json](_locales/en_CA/messages.json) to a new folder with the proper language code inside [\_locales](_locales) then follow [this guide](https://guides.github.com/activities/forking/) to create a pull request.

Only the "message" values need to be translated, the "description" is just to give some context to translators.

**Related Links:**
- https://developer.mozilla.org/Add-ons/WebExtensions/API/i18n/Locale-Specific_Message_reference
- https://developer.mozilla.org/Add-ons/WebExtensions/Internationalization

## Testing
Run `npm run dev` to build the dev build then `npm run webext` to start a Firefox instance with the addon

## Building
Run `npm run prod` to build the minified production build
