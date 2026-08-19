# API to Swift Playgrounds

A classroom companion for **Years 7–8 students using iPads and Swift Playgrounds**.

## Purpose

Students keep this web app open in Safari while they build an app in Swift Playgrounds. The web app provides a structured learning path rather than a complete finished solution.

## Student workflow

1. Choose one of 10 no-key public APIs.
2. Test the live endpoint and inspect the JSON.
3. Identify the fields the app needs.
4. Copy a small `Codable` model into Swift Playgrounds.
5. Copy/adapt the `URLSession` async/await fetch routine.
6. Copy/adapt a starter SwiftUI interface.
7. Run and test on the iPad.
8. Add one student-designed innovation.
9. Capture evidence and reflect.

## iPad features

- Large touch-friendly controls.
- Responsive portrait/landscape layout.
- Copy Swift Code buttons for each stage.
- Live JSON tester.
- JSON detective questions.
- AI prompt builder for use with a school-approved AI tool.
- Evidence checklist saved in the browser.
- No assumption that students have VS Code, Terminal or a local Node development environment.

## 10 starter APIs

- Cat Facts
- Dog CEO
- FishWatch
- Art Institute of Chicago
- EmojiHub
- AmiiboAPI
- Rick and Morty API
- Open-Meteo
- Spaceflight News
- Nager.Date Holidays

## Running the classroom companion

The teacher can host this on a web server or deploy it so students simply open the URL in Safari.

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Teaching principle

The supplied Swift code is deliberately small. Students should be able to explain what the URL, JSON, `Codable`, `URLSession`, `JSONDecoder` and SwiftUI elements are doing before adding an extension.

Public APIs can change. Test the live endpoints before beginning a new unit.
