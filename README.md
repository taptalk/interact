<img src="icon.jpg" alt="Flame Icon" width="72"/>


Interact
======

*Interactive node console, extended.*

With interact you can customize your interactive node console with functionality like auto-import, reload, promises.

## Installation

    npm install @leonardvandriel/interact

Add console script to `package.json`:
    "scripts": {
      "console": "node -i -e \"$(node -e \"require('./index.cli.js')\")\""
    },

And for convenience, alias `npm run-script console` (add this to ~/.bashrc):

	alias console="npm run-script console"


## Usage

Start the console:

    console

Or if you did not alias:

    npm run-script console


## Tests

    npm test


## License

Interact is licensed under the terms of the BSD 3-Clause License, see the included LICENSE file.


## Authors

- Leo Vandriel
