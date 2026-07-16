# Project conventions

## Commands

- Test: `node --test`

## Testing

- Every exported file under `src/` has a matching `test/<source-basename>.test.js` file.
- Exported key-normalization helpers return a string and do not throw for string input.

## Project Structure

- `src/` contains implementation.
- `test/` contains tests.
