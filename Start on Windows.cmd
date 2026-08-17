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

rem A runtime beside this file means the reader downloaded the packaged archive and has installed
rem nothing. Preferred over whatever is on PATH rather than used as a fallback, because the point
rem of the archive is that it does not depend on the machine, and a reader with an old or broken
rem Node on PATH is exactly the reader least able to work out why the bundled one was ignored.
rem Absent, this is a clone or a "Download ZIP", and PATH is the only runtime there is.
if exist "%~dp0runtime\node.exe" goto bundled

where node >nul 2>nul
if errorlevel 1 goto no_node

node server.mjs
goto stopped

:bundled
"%~dp0runtime\node.exe" server.mjs
goto stopped

rem Reached only from a clone or a "Download ZIP", since the packaged archive carries its own
rem runtime and never gets here. The ready-made download is named first because this reader has
rem just proved they do not have Node, and telling them to install a runtime is asking for the
rem step the archive exists to remove. The second line is still worth keeping for anyone who
rem wanted the source.
:no_node
echo.
echo Node.js is not installed, or Windows cannot find it.
echo.
echo The easiest fix is the ready-made download, which needs nothing installed. Get it from
echo the Releases page of this project on GitHub, unzip it, and double-click the start file
echo inside.
echo.
echo Or, to run this copy as it is, install the version marked LTS from https://nodejs.org,
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
