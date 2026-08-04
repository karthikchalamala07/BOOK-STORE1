import { Book } from "../types";

const COVER_MAP: Record<string, string> = {
  // Preloaded Classics
  "dracula": "/dracula-cover.jpg",
  "pride-and-prejudice": "/pride-and-prejudice-cover.jpg",
  "sherlock-holmes": "https://covers.openlibrary.org/b/id/6717853-L.jpg",
  "alice-in-wonderland": "https://covers.openlibrary.org/b/id/10527843-L.jpg",
  "art-of-war": "https://covers.openlibrary.org/b/id/9054486-L.jpg",
  "frankenstein": "https://covers.openlibrary.org/b/id/12356249-L.jpg",

  // Metadata Pool Classic Volumes
  "sense-and-sensibility": "https://covers.openlibrary.org/b/id/14595351-L.jpg",
  "emma": "https://covers.openlibrary.org/b/id/14595301-L.jpg",
  "persuasion": "https://covers.openlibrary.org/b/id/14595304-L.jpg",
  "jane-eyre": "https://covers.openlibrary.org/b/id/14595349-L.jpg",
  "wuthering-heights": "https://covers.openlibrary.org/b/id/14595347-L.jpg",
  "a-tale-of-two-cities": "https://covers.openlibrary.org/b/id/14595407-L.jpg",
  "great-expectations": "https://covers.openlibrary.org/b/id/14595345-L.jpg",
  "oliver-twist": "https://covers.openlibrary.org/b/id/14595343-L.jpg",
  "david-copperfield": "https://covers.openlibrary.org/b/id/14595341-L.jpg",
  "don-quixote": "https://covers.openlibrary.org/b/id/14595329-L.jpg",
  "the-hound-of-the-baskervilles": "https://covers.openlibrary.org/b/id/14595435-L.jpg",
  "the-sign-of-four": "https://covers.openlibrary.org/b/id/14595433-L.jpg",
  "the-strange-case-of-dr-jekyll-and-mr-hyde": "https://covers.openlibrary.org/b/id/14595293-L.jpg",
  "the-picture-of-dorian-gray": "https://covers.openlibrary.org/b/id/14595337-L.jpg",
  "through-the-looking-glass": "https://covers.openlibrary.org/b/id/14595297-L.jpg",
  "peter-pan": "https://covers.openlibrary.org/b/id/14595299-L.jpg",
  "peter-pan-classic-": "https://covers.openlibrary.org/b/id/14595299-L.jpg",
  "the-wonderful-wizard-of-oz": "https://covers.openlibrary.org/b/id/14595302-L.jpg",
  "treasure-island": "https://covers.openlibrary.org/b/id/14595306-L.jpg",
  "the-count-of-monte-cristo": "https://covers.openlibrary.org/b/id/12491262-L.jpg",
  "the-three-musketeers": "https://covers.openlibrary.org/b/id/14595323-L.jpg",
  "around-the-world-in-eighty-days": "https://covers.openlibrary.org/b/id/14595315-L.jpg",
  "journey-to-the-center-of-the-earth": "https://covers.openlibrary.org/b/id/14595312-L.jpg",
  "twenty-thousand-leagues-under-the-sea": "https://covers.openlibrary.org/b/id/14595314-L.jpg",
  "the-jungle-book": "https://covers.openlibrary.org/b/id/14595305-L.jpg",
  "the-call-of-the-wild": "https://covers.openlibrary.org/b/id/14595463-L.jpg",
  "white-fang": "https://covers.openlibrary.org/b/id/14595465-L.jpg",
  "heart-of-darkness": "https://covers.openlibrary.org/b/id/14595333-L.jpg",
  "arabian-nights": "https://covers.openlibrary.org/b/id/14595439-L.jpg",
  "the-time-machine": "https://covers.openlibrary.org/b/id/14595316-L.jpg",
  "the-invisible-man": "https://covers.openlibrary.org/b/id/14595320-L.jpg",
  "the-war-of-the-worlds": "https://covers.openlibrary.org/b/id/14595318-L.jpg",
  "the-secret-garden": "https://covers.openlibrary.org/b/id/14595303-L.jpg",
  "black-beauty": "https://covers.openlibrary.org/b/id/14595300-L.jpg",
  "grimm-s-fairy-tales": "https://covers.openlibrary.org/b/id/14595437-L.jpg",
  "little-women": "https://covers.openlibrary.org/b/id/14595353-L.jpg",
  "the-scarlet-letter": "https://covers.openlibrary.org/b/id/14595355-L.jpg",
  "the-odyssey": "https://covers.openlibrary.org/b/id/14595447-L.jpg",
  "the-iliad": "https://covers.openlibrary.org/b/id/14595445-L.jpg",
  "beowulf": "https://covers.openlibrary.org/b/id/14595449-L.jpg",
  "the-divine-comedy": "https://covers.openlibrary.org/b/id/14595453-L.jpg",
  "paradise-lost": "https://covers.openlibrary.org/b/id/14595451-L.jpg",
  "leaves-of-grass": "https://covers.openlibrary.org/b/id/14595467-L.jpg",
  "the-prince": "https://covers.openlibrary.org/b/id/14595455-L.jpg",
  "meditations": "https://covers.openlibrary.org/b/id/14595459-L.jpg",
  "the-republic": "https://covers.openlibrary.org/b/id/14595469-L.jpg",
  "walden": "https://covers.openlibrary.org/b/id/14595461-L.jpg",
  "the-federalist-papers": "https://covers.openlibrary.org/b/id/14595471-L.jpg",
  "the-importance-of-being-earnest": "https://covers.openlibrary.org/b/id/14595473-L.jpg",
  "moby-dick": "https://covers.openlibrary.org/b/id/14595308-L.jpg"
};

const coverCache: Record<string, string> = {};

// Helper to check if a URL is a stock photo or placeholder
export function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  if (url.includes("images.unsplash.com")) return true;
  if (url.includes("placeholder")) return true;
  return false;
}

export function generatePremiumFallback(title: string, author: string): string {
  const cacheKey = `${title}|${author}`;
  if (coverCache[cacheKey]) return coverCache[cacheKey];

  if (typeof document === "undefined") {
    // If running in a non-browser environment
    return "";
  }

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 1. Draw premium black leather background
  ctx.fillStyle = "#121212";
  ctx.fillRect(0, 0, 600, 800);

  // Leather grain noise
  ctx.fillStyle = "rgba(255, 255, 255, 0.012)";
  for (let i = 0; i < 25000; i++) {
    const x = Math.random() * 600;
    const y = Math.random() * 800;
    const r = Math.random() * 1.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rich dark gradient overlay
  const grad = ctx.createRadialGradient(300, 400, 50, 300, 400, 500);
  grad.addColorStop(0, "rgba(26, 26, 26, 0.95)");
  grad.addColorStop(1, "rgba(6, 6, 6, 1)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 800);

  // 2. Gold borders
  ctx.strokeStyle = "#C9A227";
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 560, 760);

  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "rgba(201, 162, 39, 0.4)";
  ctx.strokeRect(30, 30, 540, 740);

  // Corner details
  ctx.fillStyle = "#C9A227";
  const dots = [
    [35, 35], [565, 35], [35, 765], [565, 765]
  ];
  dots.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Branding
  ctx.fillStyle = "#C9A227";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "bold 20px 'Playfair Display', 'Georgia', serif";
  ctx.fillText("S T O R Y V A U L T", 300, 65);

  ctx.fillStyle = "rgba(201, 162, 39, 0.6)";
  ctx.font = "10px 'Manrope', sans-serif";
  ctx.fillText("L I T E R A R Y   C O L L E C T I B L E", 300, 95);

  // 4. Wrap & Draw Title
  ctx.fillStyle = "#F3D675";
  ctx.font = "bold 32px 'Playfair Display', 'Georgia', serif";
  ctx.textBaseline = "middle";

  const words = title.toUpperCase().split(" ");
  const lines: string[] = [];
  let currentLine = "";
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = ctx.measureText(testLine).width;
    if (width > 480) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  lines.push(currentLine);

  const titleCenterY = 320;
  const lineHeight = 46;
  const totalHeight = lines.length * lineHeight;
  const startY = titleCenterY - (totalHeight / 2) + (lineHeight / 2);

  lines.forEach((line, idx) => {
    ctx.fillText(line, 300, startY + (idx * lineHeight));
  });

  // Divider Line
  ctx.strokeStyle = "rgba(201, 162, 39, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(250, startY + totalHeight + 10);
  ctx.lineTo(350, startY + totalHeight + 10);
  ctx.stroke();

  // Author Name
  ctx.fillStyle = "#E5B82B";
  ctx.font = "italic 22px 'Playfair Display', 'Georgia', serif";
  ctx.fillText(author, 300, startY + totalHeight + 45);

  // 5. Bottom Emblem
  const emblemY = 690;
  ctx.strokeStyle = "rgba(201, 162, 39, 0.4)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(300, emblemY, 20, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#C9A227";
  ctx.font = "bold 13px 'Playfair Display', 'Georgia', serif";
  ctx.fillText("SV", 300, emblemY - 8);

  ctx.fillStyle = "rgba(201, 162, 39, 0.5)";
  ctx.font = "8px 'Manrope', sans-serif";
  ctx.fillText("P U B L I C   D O M A I N   A R C H I V E", 300, emblemY + 30);

  const dataUrl = canvas.toDataURL("image/webp", 0.9);
  coverCache[cacheKey] = dataUrl;
  return dataUrl;
}

export function resolveBookCover(book: Partial<Book> & { id: string; title: string; author: string }): string {
  // Check if we have mapped an authentic cover
  const mapped = COVER_MAP[book.id];
  if (mapped) return mapped;

  // Check by formatting the title as id
  const formattedId = book.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const mappedFormatted = COVER_MAP[formattedId];
  if (mappedFormatted) return mappedFormatted;

  // Fallback check
  if (isPlaceholderUrl(book.coverUrl) || book.id.startsWith("extra-")) {
    return generatePremiumFallback(book.title, book.author);
  }

  return book.coverUrl || "";
}
