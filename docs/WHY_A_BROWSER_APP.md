# Why a web app and not an Android emulator

This records why Recap Page is a browser companion rather than a way to run
Marvel's own Android app on a PC. It is kept so nobody spends another weekend retrying the
emulator route.

It is a record of a decision, not instructions. Nothing here is needed to run the app. For
that, see [the README](../README.md).

## Why a web app and not BlueStacks

This started as an attempt to run the Marvel Unlimited **Android** app via BlueStacks. That
did not work on this hardware, and it is worth writing down so nobody retries it:

- The machine is **ARM64** (Snapdragon X Elite). BlueStacks' published minimum spec is
  "Intel or AMD Processor", and its installer ships as `..._amd64_native.exe`.
- BlueStacks (and NoxPlayer, LDPlayer, MEmu, MuMu) load **kernel-mode hypervisor drivers**.
  Windows on ARM's x86-64 emulation (Prism) is user-mode only, and kernel drivers have to be
  compiled natively for ARM64.
- **Google Play Games on PC** targets x86 Intel/AMD hosts.
- **Windows Subsystem for Android** was removed from the Microsoft Store on 2025-03-05.
- The **Android Studio emulator** ships `arm64-v8a` Google Play system images, but Google
  publishes the Windows emulator binary as x64 only. There is no Windows ARM64 build.

Marvel supports Marvel Unlimited on Windows through the browser (streaming only; offline
downloads remain iOS/Android). Edge and Chrome are both ARM64-native here, so a
browser-based companion runs without an emulation layer in the way.

## Where the underlying evidence lives

The findings above were established during the original research phase, and the constraints
table in the research artifact under `.copilot-tracking/research/` for 2026-08-03 carries
them with the command output and sources behind each one, including the processor query, the
Google SDK repository XML showing every Windows emulator archive as x64, the archived
Microsoft notice for Windows Subsystem for Android, and the PE header machine type that
confirms both browsers are ARM64-native.

That artifact is a dated historical record. Read it as evidence of what was true when it was
written, not as a page to keep current.
