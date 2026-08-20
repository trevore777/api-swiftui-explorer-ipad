// Reliability fixes for Art Institute, EmojiHub and FishWatch.
// Loaded after app-v2.js and before guide.js so all student snippets remain aligned.

const fixes = {
  'FishWatch': {
    model: `struct Fish: Codable, Identifiable {
    var id: String { speciesName ?? UUID().uuidString }
    let speciesName: String?
    let scientificName: String?

    enum CodingKeys: String, CodingKey {
        case speciesName = "Species Name"
        case scientificName = "Scientific Name"
    }
}`,
    fetch: `@State private var fish: [Fish] = []
@State private var message = "Loading fish…"

func loadData() async {
    guard let url = URL(string: "https://www.fishwatch.gov/api/species") else { return }

    var request = URLRequest(url: url)
    request.setValue("Mozilla/5.0", forHTTPHeaderField: "User-Agent")

    do {
        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse,
              http.statusCode == 200 else {
            message = "FishWatch did not return data."
            return
        }

        let allFish = try JSONDecoder().decode([Fish].self, from: data)
        fish = Array(allFish.filter { $0.speciesName != nil }.prefix(15))
        message = fish.isEmpty ? "No fish found." : "Loaded \\(fish.count) fish"
    } catch {
        message = "Could not load FishWatch data."
    }
}`,
    view: `VStack(spacing: 10) {
    Text("FishWatch").font(.largeTitle.bold())
    Text(message).font(.caption)

    if fish.isEmpty {
        ProgressView()
    } else {
        List(fish) { item in
            VStack(alignment: .leading, spacing: 4) {
                Text(item.speciesName ?? "Unknown fish")
                    .font(.headline)
                Text(item.scientificName ?? "Scientific name unavailable")
                    .font(.caption)
            }
        }
    }
}
.task { await loadData() }`
  },

  'Art Institute of Chicago': {
    model: `struct ArtResponse: Codable {
    let data: Artwork
    let config: ArtConfig
}

struct Artwork: Codable {
    let title: String
    let artist_display: String?
    let image_id: String?
}

struct ArtConfig: Codable {
    let iiif_url: String
}`,
    fetch: `@State private var artwork: Artwork?
@State private var imageURL = ""
@State private var message = "Loading artwork…"

func loadData() async {
    let address = "https://api.artic.edu/api/v1/artworks/27992?fields=id,title,artist_display,image_id"
    guard let url = URL(string: address) else { return }

    do {
        let (data, _) = try await URLSession.shared.data(from: url)
        let result = try JSONDecoder().decode(ArtResponse.self, from: data)
        artwork = result.data

        if let imageID = result.data.image_id {
            imageURL = result.config.iiif_url + "/" + imageID + "/full/843,/0/default.jpg"
        }

        message = ""
    } catch {
        message = "Could not load artwork."
    }
}`,
    view: `VStack(spacing: 12) {
    Text("Art Museum").font(.largeTitle.bold())

    if let art = artwork {
        AsyncImage(url: URL(string: imageURL)) { phase in
            if let image = phase.image {
                image
                    .resizable()
                    .scaledToFit()
            } else if phase.error != nil {
                VStack {
                    Image(systemName: "photo")
                        .font(.system(size: 50))
                    Text("Artwork image could not load")
                }
            } else {
                ProgressView("Loading image…")
            }
        }
        .frame(maxHeight: 380)

        Text(art.title)
            .font(.title2.bold())
            .multilineTextAlignment(.center)
        Text(art.artist_display ?? "Unknown artist")
            .font(.caption)
            .multilineTextAlignment(.center)
    } else {
        Text(message)
        ProgressView()
    }
}
.padding()
.task { await loadData() }`
  },

  'EmojiHub': {
    model: `struct EmojiItem: Codable {
    let name: String
    let category: String
    let unicode: [String]
}`,
    fetch: `@State private var emoji: EmojiItem?
@State private var symbol = "🙂"
@State private var message = "Loading emoji…"

func emojiText(from codes: [String]) -> String {
    codes.compactMap { code in
        let hex = code.replacingOccurrences(of: "U+", with: "")
        guard let value = UInt32(hex, radix: 16),
              let scalar = UnicodeScalar(value) else { return nil }
        return String(scalar)
    }.joined()
}

func loadData() async {
    guard let url = URL(string: "https://emojihub.yurace.pro/api/random") else { return }

    do {
        let (data, _) = try await URLSession.shared.data(from: url)
        let result = try JSONDecoder().decode(EmojiItem.self, from: data)
        emoji = result
        symbol = emojiText(from: result.unicode)
        message = ""
    } catch {
        message = "Could not load an emoji."
    }
}`,
    view: `VStack(spacing: 16) {
    Text("Emoji Explorer")
        .font(.largeTitle.bold())

    Text(symbol)
        .font(.system(size: 100))

    Text(emoji?.name ?? message)
        .font(.title2)

    Text(emoji?.category ?? "")
        .foregroundStyle(.secondary)

    Button("Another Emoji") {
        Task { await loadData() }
    }
    .buttonStyle(.borderedProminent)
}
.padding()
.task { await loadData() }`
  }
};

function applyReliabilityFixes() {
  const detail = document.querySelector('#detail');
  if (!detail || detail.querySelector('.playgrounds-guide')) return;

  const title = detail.querySelector('h2')?.textContent?.trim();
  const fix = fixes[title];
  if (!fix) return;

  const model = detail.querySelector('#model');
  const fetch = detail.querySelector('#fetch');
  const view = detail.querySelector('#view');
  if (!model || !fetch || !view) return;

  model.textContent = fix.model;
  fetch.textContent = fix.fetch;
  view.textContent = fix.view;
}

const detail = document.querySelector('#detail');
if (detail) {
  applyReliabilityFixes();
  const observer = new MutationObserver(() => applyReliabilityFixes());
  observer.observe(detail, { childList: true, subtree: false });
}
