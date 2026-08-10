// The page's entry point, and deliberately the only thing that runs the application.
//
// `src/js/main.js` used to be loaded directly, which meant importing it was the same act as
// starting it. That made the module untestable in Node twice over: it read the document while
// being evaluated, so the import threw before any test body could install a double, and it
// exported nothing, so an import that did succeed handed back an empty object with no render
// path to call. Splitting the entry from the module fixes both without a DOM implementation
// and without waiting for the file to be split by view.
//
// This file is intentionally tiny. Anything added here is code no test can reach, because this
// is the one module that a test cannot import without starting the app.
import { boot } from './main.js';

boot();
