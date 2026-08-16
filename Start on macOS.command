#!/bin/bash
# Double-click this to start the tracker.
#
# It exists because the alternative is a terminal, and "open a terminal, change directory, type
# a command" is where somebody who does not program stops reading. Everything here is what the
# README's step 2 says, done by the file instead of by the person.
#
# The .command extension is what makes Finder run it on a double-click rather than open it in a
# text editor, and it is why this file is not called .sh. It has to be executable, which the git
# index records, so a clone keeps the bit.

# The directory change is the whole trick: a double-clicked script starts in the home directory,
# and `node server.mjs` from there is a "Cannot find module" that names a path the reader never
# typed. This is the file's own folder, so it works from wherever the project was unzipped.
cd "$(dirname "$0")" || exit 1

# Nothing here sets MRT_PORT. The server defaults to 8787, and the reading progress is filed by
# the browser under the exact address it was saved at, so a port set here would move everyone who
# double-clicks this to an empty app. See "Always open the same address" in the README.

if ! command -v node >/dev/null 2>&1; then
  echo
  echo "Node.js is not installed, or this Mac cannot find it."
  echo
  echo "The tracker needs it to run. Install the LTS version from https://nodejs.org,"
  echo "then close this window and double-click this file again."
  echo
  read -r -p "Press Return to close."
  exit 1
fi

node server.mjs

# Reached when the server stops, whether that was Ctrl+C or a failure to start. Terminal can be
# set to close the window the moment a command finishes, and without this the message goes with
# it: a port already in use then looks identical to nothing happening at all.
echo
echo "The tracker has stopped. Your reading progress is saved in your browser and is not lost."
read -r -p "Press Return to close."
