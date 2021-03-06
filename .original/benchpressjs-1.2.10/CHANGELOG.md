<!--
Detail changes here upon release

Format:

## Version <version> (<date>)

### New

- Large improvements
- Features

### Fixes

- Bug fixes
- Small improvements
-->

## Version 1.2.7 (2018-11-03)

### New

- Remove Onig dependency

### Fixes

- Upgrade neon to v0.2
- Add warning for VS2015 requirement

## Version 1.2.6 (2018-7-28)

### Fixes

- Legacy helpers without arguments at the top level no longer result in runtime errors
- Legacy syntax (`IF stuff`) no longer allowed within modern block syntax (`{{{ if stuff }}}`) and vice-versa

## Version 1.2.5 (2018-7-17)

### Fixes

- Unicode support for rust compiler

## Version 1.2.4 (2018-7-16)

### Fixes

- Rust compiler optimizations

## Version 1.2.3 (2018-7-14)

### Fixes

- Update dependencies
- Ignore unnecessary build artifacts

## Version 1.2.2 (2018-7-14)

### New

- Re-implement the compiler in rust
  + Speed up compile times by orders of magnitude
  + Native bindings with JS fallback
  + Fully compatible (except unsafe)
  + Will attempt to compile on install
  + If that fails, will try precompiled version
  + If that fails, will fall back to JS version
  + Add more tests to catch previously untested bugs
  + Make the extra tokens algorithm more forgiving
  + Add benchmarks for compilation
  + Build binaries with CI
  + benchchpress-rs in a separate repo with a git submodule here

### Fixes

- Use `new Function` instead of `vm.runInNewContext` (#77)
  + Results in slight performance improvements client-side

## Version 1.2.1 (2018-2-19)

### Fixes

- Empty template files will now render to an empty string (#75)

## Version 1.2.0 (2017-11-24)

### New

- Add new helper syntax which looks like a function call: `helperName(...args)`

## Version 1.1.0 (2017-9-23)

### New

- Add `unsafe` compilation option
  + Disables property access guarding
  + Only supports iterating over dense array-like objects
  + Doesn't need `Benchpress.runtime` to render, can be called like `template(helpers, data)`
- Add `.render` and `.compileRender`, Promise-based methods doing what `.parse` and `.compileParse` did
- `.precompile` now returns and Promise or takes a callback
- `loader` functions can now return a Promise instead of receiving a callback

### Deprecations
The following deprecated functionality will be removed in v2.0.0

- use `.render` instead of `.parse` 
- use `.compileRender` instead of `.compileParse`
- `loader` functions should return a Promise instead of receiving a callback

## Version 1.0.4 (2017-9-13)

### Fixes

- Fix `Object.keys` on empty string error (#73)
- Make `evaluate` timeout longer

## Version 1.0.3 (2017-8-30)

### Fixes

- Fix not using cache client side

## Version 1.0.2 (2017-8-30)

### New

- Add issue template
- Add syntax documentation

### Fixes

- Fix duplicate existence checks

## Version 1.0.1 (2017-7-24)

### New

- Improve extensibility
- Test more Node versions

### Fixes

- Fix path undefined error

## Version 1.0.0 (2017-7)

Initial release