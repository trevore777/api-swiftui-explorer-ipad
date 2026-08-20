# API to Swift Playgrounds

A Years 7–8 classroom companion for iPad + Swift Playgrounds.

Students can:
- choose from 10 no-key public APIs
- test live JSON in Safari
- copy four aligned Swift snippets
- copy a complete working `ContentView.swift` file
- use a prompt builder to ask for guided improvements
- collect evidence of testing and iteration

## Swift Playgrounds workflow

1. Choose an API.
2. Test the JSON.
3. Add the Codable model.
4. Add the `@State` variables.
5. Replace the complete `var body: some View { ... }` block.
6. Add the API function.
7. Run and improve the app.
8. Capture evidence.

## Reliability notes

The classroom examples are intentionally simplified. They auto-load their first request, show visible error states, and only decode the fields students need.

Recent fixes include:
- Art Institute images built from the API response `config.iiif_url` plus `image_id`.
- EmojiHub Unicode values converted into the actual displayed emoji character.
- FishWatch requests made with an explicit user agent and filtered to usable species records.

Public APIs can change. Re-test examples before starting a new teaching unit.
