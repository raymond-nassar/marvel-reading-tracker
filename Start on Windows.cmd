@echo off
rem Double-click this to start the tracker.
rem
rem It exists because the alternative is a terminal, and "open a terminal, change directory,
rem type a command" is where somebody who does not program stops reading. Everything here is
rem what the README's step 2 says, done by the file instead of by the person.
rem
rem Written with gotos rather than parenthesised if-blocks, which is not a style preference.
rem cmd.exe has never parsed a multi-line block reliably in a file with Unix line endings, and
rem the friend this file is for arrives by "Download ZIP", where the endings depend on how the
rem archive was produced rather than on anything this repository controls. A file of one-line
rem statements runs the same either way. .gitattributes asks for CRLF as well, which makes that
rem request an optimisation rather than something this has to depend on.
setlocal
cd /d "%~dp0"

rem The directory change above is the whole trick: Windows starts a double-clicked script in
rem whatever folder the shell happened to be in, and `node server.mjs` from the wrong folder is a
rem "Cannot find module" naming a path the reader never typed. %~dp0 is this file's own folder,
rem so it works from wherever the project was unzipped.

rem Nothing here sets MRT_PORT. The server defaults to 8787, and the browser files reading
rem progress under the exact address it was saved at, so a port set here would move everyone who
rem double-clicks this to an empty app. See "Always open the same address" in the README.

where node >nul 2>nul
if errorlevel 1 goto no_node

node server.mjs
goto stopped

:no_node
echo.
echo Node.js is not installed, or Windows cannot find it.
echo.
echo The tracker needs it to run. Install the version marked LTS from https://nodejs.org,
echo then close this window and double-click this file again.
echo.
pause
exit /b 1

rem Reached when the server stops, whether that was Ctrl+C or a failure to start. Without the
rem pause the window closes on the same frame and takes the message with it, which is how a port
rem that is already in use comes to look identical to nothing happening at all.
:stopped
echo.
echo The tracker has stopped. Your reading progress is saved in your browser and is not lost.
pause
