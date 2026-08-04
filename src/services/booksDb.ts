import { Book, Author } from "../types";
import { resolveBookCover } from "./coverService";

const PRELOADED_CLASSICS: Book[] = [
  {
    id: "dracula",
    title: "Dracula",
    author: "Bram Stoker",
    genre: "Horror",
    year: 1897,
    language: "English",
    coverUrl: "/dracula-cover.jpg",
    description: "A chilling tale of the ancient vampire Count Dracula as he attempts to relocate from Transylvania to England to find new blood and spread his undead curse.",
    quote: "I am Dracula; and I bid you welcome, Mr. Harker, to my house. Come in; the night air is chill, and you must need to eat and rest.",
    gutenbergId: "345",
    chapters: [
      {
        title: "Chapter I: Jonathan Harker's Journal",
        content: [
          "3 May. Bistritz.—Left Munich at 8:30 P.M., on 1st May, arriving at Vienna early next morning; should have arrived at 6:46, but train was an hour late. Buda-Pesth seems a wonderful place, from the glimpse which I got of it from the train and the little I could walk through the streets.",
          "I feared to go very far from the station, as we had arrived late and would start as near the correct time as possible. The impression I had was that we were leaving the West and entering the East; the most western of splendid bridges over the Danube, which is here of noble width and depth, took us among the traditions of Turkish rule.",
          "We left in pretty good time, and came after nightfall to Klausenburgh. Here I stopped for the night at the Hotel Royale. I had for dinner, or rather supper, a chicken done up some way with red pepper, which was very good but gave me a thirst. (Mem., get recipe for Mina. I asked the waiter, and he said it was called 'paprika hendl,' and that, as it was a national dish, I should be able to get it anywhere along the Carpathians.)",
          "I found my smattering of German very useful; indeed, I don't know how I should be able to get on without it.",
          "Having had some time at my disposal when in London, I had visited the British Museum, and made search among the books and maps in the library regarding Transylvania; it had struck me that some foreknowledge of the country could not but have some importance in dealing with a nobleman of that country.",
          "I found that the district he named is in the extreme east of the country, just on the borders of three states, Transylvania, Moldavia and Bukovina, in the midst of the Carpathian mountains; one of the wildest and least known portions of Europe.",
          "I was not able to light on any map or work giving the exact locality of the Castle Dracula, as there are no maps of this country as yet to compare with our own Ordnance Survey maps; but I found that Bistritz, the post town named by Count Dracula, is a fairly well-known place. I shall enter here some of my notes, as they may refresh my memory when I talk over my travels with Mina."
        ]
      },
      {
        title: "Chapter II: The Castle Gate",
        content: [
          "When the chaise stopped, the driver jumped down and held out his hand to assist me to alight. Again I could not but notice his prodigious strength. His hand actually seemed like a steel vice that could have crushed mine if he had chosen.",
          "Then he took my traps, and placed them on the ground beside me as I stood close to a great iron door, old and studded with large iron nails, and set in a projecting gateway of massive stone.",
          "I could see even in the dim light that the stone was carved, but that the carving had been much worn by time and weather. The driver climbed again to his seat and shook the reins; the horses started forward, and trap and all disappeared down one of the dark openings in the courtyard.",
          "I stood in silence where I was, for I did not know what to do. Of bell or knocker there was no sign; through these gloomy walls and dark window openings my voice was not likely to penetrate.",
          "The time I waited seemed endless, and I felt doubts and fears crowding upon me. What sort of grim adventure was I entering on? Was this a customary incident in the life of a solicitor's clerk sent out to explain the purchase of a London estate to a foreigner?"
        ]
      }
    ]
  },
  {
    id: "pride-and-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    year: 1813,
    language: "English",
    coverUrl: "/pride-and-prejudice-cover.jpg",
    description: "An elegant comedy of manners centering on the turbulent relationship between Elizabeth Bennet, the daughter of a country gentleman, and Fitzwilliam Darcy, a rich aristocratic landowner.",
    quote: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    gutenbergId: "1342",
    chapters: [
      {
        title: "Chapter I: A Truth Acknowledged",
        content: [
          "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
          "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
          "\"My dear Mr. Bennet,\" said his lady to him one day, \"have you heard that Netherfield Park is let at last?\"",
          "Mr. Bennet replied that he had not.",
          "\"But it is,\" returned she; \"for Mrs. Long has just been here, and she told me all about it.\"",
          "Mr. Bennet made no answer.",
          "\"Do you not want to know who has taken it?\" cried his wife impatiently.",
          "\"You want to tell me, and I have no objection to hearing it.\"",
          "This was invitation enough.",
          "\"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week.\""
        ]
      },
      {
        title: "Chapter II: Mr. Bennet's Visit",
        content: [
          "Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it.",
          "It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with: \"I hope Mr. Bingley will like it, Lizzy.\"",
          "\"We are not in a way to know what Mr. Bingley likes,\" said her mother resentfully, \"since we are not to visit.\""
        ]
      }
    ]
  },
  {
    id: "sherlock-holmes",
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    genre: "Mystery",
    year: 1892,
    language: "English",
    coverUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600",
    description: "A collection of twelve detective stories featuring Arthur Conan Doyle's detective Sherlock Holmes and his loyal biographer Dr. John H. Watson, solving cases in late-Victorian London.",
    quote: "To Sherlock Holmes she is always *the woman*. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex.",
    gutenbergId: "1661",
    chapters: [
      {
        title: "I: A Scandal in Bohemia",
        content: [
          "To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler.",
          "All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind. He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position.",
          "He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions. But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results.",
          "Grit in a sensitive instrument, or a crack in one of his own high-power lenses, would not be more disturbing than a strong emotion in a nature such as his. And yet there was but one woman to him, and that woman was the late Irene Adler, of dubious and questionable memory."
        ]
      }
    ]
  },
  {
    id: "alice-in-wonderland",
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    genre: "Fantasy",
    year: 1865,
    language: "English",
    coverUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=600",
    description: "A whimsical dreamscape story of Alice, a young girl who falls down a rabbit hole into a bizarre fantasy world populated by anthropomorphic creatures and governed by nonsense logic.",
    quote: "Curiouser and curiouser! Cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English).",
    gutenbergId: "11",
    chapters: [
      {
        title: "Chapter I: Down the Rabbit-Hole",
        content: [
          "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, \"and what is the use of a book,\" thought Alice \"without pictures or conversations?\"",
          "So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.",
          "There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, \"Oh dear! Oh dear! I shall be late!\" (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she have never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge."
        ]
      }
    ]
  },
  {
    id: "art-of-war",
    title: "The Art of War",
    author: "Sun Tzu",
    genre: "Strategy",
    year: -500,
    language: "English",
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    description: "An ancient Chinese military treatise attributed to Sun Tzu, a high-ranking military general, strategist, and tactician, detailing a complete philosophy of conflict management and victory.",
    quote: "All warfare is based on deception. Hence, when we are able to attack, we must seem unable; when using our forces, we must seem inactive.",
    gutenbergId: "132",
    chapters: [
      {
        title: "I. Laying Plans",
        content: [
          "Sun Tzu said: The art of war is of vital importance to the State.",
          "It is a matter of life and death, a road either to safety or to ruin. Hence it is a subject of inquiry which can on no account be neglected.",
          "The art of war, then, is governed by five constant factors, to be taken into account in one's deliberations, when seeking to determine the conditions obtaining in the field.",
          "These are: (1) The Moral Law; (2) Heaven; (3) Earth; (4) The Commander; (5) Method and Discipline."
        ]
      }
    ]
  },
  {
    id: "frankenstein",
    title: "Frankenstein",
    author: "Mary Shelley",
    genre: "Science Fiction",
    year: 1818,
    language: "English",
    coverUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=600",
    description: "A dark cautionary masterpiece describing Victor Frankenstein's tragic creation of an artificial, sentient giant creature, leading to a desperate cycle of rejection, revenge, and ruin.",
    quote: "I beheld the wretch—the miserable monster whom I had created. He held up the curtain of the bed; and his eyes, if eyes they may be called, were fixed on me.",
    gutenbergId: "84",
    chapters: [
      {
        title: "Chapter I: Family Heritage",
        content: [
          "I am by birth a Genevese, and my family is one of the most distinguished of that republic. My ancestors had been for many years counsellors and syndics; and my father had filled several public situations with honour and reputation.",
          "He was respected by all who knew him for his integrity and indefatigable attention to public business. He passed his younger days perpetually occupied by the affairs of his country; a variety of circumstances had prevented his marrying early, nor was it until the decline of life that he became a husband and the father of a family."
        ]
      }
    ]
  }
];

// Structured catalog expansion array
const METADATA_POOL = [
    // Added for Historic Gallery expansion
    { title: "Robinson Crusoe", author: "Daniel Defoe", genre: "Adventure", year: 1719, pages: 320, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
    { title: "Gulliver's Travels", author: "Jonathan Swift", genre: "Adventure", year: 1726, pages: 300, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
    { title: "The Raven and Other Tales", author: "Edgar Allan Poe", genre: "Horror", year: 1845, pages: 250, lang: "English", cover: "https://images.unsplash.com/photo-1509248961158-e54f6934749c" },
    { title: "Les Misérables", author: "Victor Hugo", genre: "Classic Literature", year: 1862, pages: 1460, lang: "English (Translation)", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
    { title: "Adventures of Huckleberry Finn", author: "Mark Twain", genre: "Classic Literature", year: 1884, pages: 366, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  // Classic Literature
  { title: "Sense and Sensibility", author: "Jane Austen", genre: "Romance", year: 1811, pages: 374, lang: "English", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f" },
  { title: "Emma", author: "Jane Austen", genre: "Romance", year: 1815, pages: 410, lang: "English", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f" },
  { title: "Persuasion", author: "Jane Austen", genre: "Romance", year: 1817, pages: 280, lang: "English", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f" },
  { title: "Jane Eyre", author: "Charlotte Brontë", genre: "Classic Literature", year: 1847, pages: 512, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Wuthering Heights", author: "Emily Brontë", genre: "Classic Literature", year: 1847, pages: 342, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "A Tale of Two Cities", author: "Charles Dickens", genre: "Classic Literature", year: 1859, pages: 448, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Great Expectations", author: "Charles Dickens", genre: "Classic Literature", year: 1861, pages: 505, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Oliver Twist", author: "Charles Dickens", genre: "Classic Literature", year: 1838, pages: 420, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "David Copperfield", author: "Charles Dickens", genre: "Classic Literature", year: 1850, pages: 850, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Don Quixote", author: "Miguel de Cervantes", genre: "Classic Literature", year: 1605, pages: 980, lang: "English (Translation)", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Moby-Dick", author: "Herman Melville", genre: "Classic Literature", year: 1851, pages: 630, lang: "English", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f" },
  
  // Mystery
  { title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", genre: "Mystery", year: 1902, pages: 256, lang: "English", cover: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f" },
  { title: "The Sign of Four", author: "Arthur Conan Doyle", genre: "Mystery", year: 1890, pages: 120, lang: "English", cover: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f" },
  
  // Horror
  { title: "The Strange Case of Dr. Jekyll and Mr. Hyde", author: "Robert Louis Stevenson", genre: "Horror", year: 1886, pages: 144, lang: "English", cover: "https://images.unsplash.com/photo-1509248961158-e54f6934749c" },
  { title: "The Picture of Dorian Gray", author: "Oscar Wilde", genre: "Horror", year: 1890, pages: 272, lang: "English", cover: "https://images.unsplash.com/photo-1509248961158-e54f6934749c" },
  
  // Fantasy
  { title: "Through the Looking-Glass", author: "Lewis Carroll", genre: "Fantasy", year: 1871, pages: 224, lang: "English", cover: "https://images.unsplash.com/photo-1476275466078-4007374efbbe" },
  { title: "Peter Pan", author: "J. M. Barrie", genre: "Fantasy", year: 1911, pages: 240, lang: "English", cover: "https://images.unsplash.com/photo-1476275466078-4007374efbbe" },
  { title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", genre: "Fantasy", year: 1900, pages: 260, lang: "English", cover: "https://images.unsplash.com/photo-1476275466078-4007374efbbe" },
  
  // Adventure
  { title: "Treasure Island", author: "Robert Louis Stevenson", genre: "Adventure", year: 1883, pages: 280, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "The Count of Monte Cristo", author: "Alexandre Dumas", genre: "Adventure", year: 1844, pages: 1200, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "The Three Musketeers", author: "Alexandre Dumas", genre: "Adventure", year: 1844, pages: 700, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Around the World in Eighty Days", author: "Jules Verne", genre: "Adventure", year: 1872, pages: 250, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Journey to the Center of the Earth", author: "Jules Verne", genre: "Adventure", year: 1864, pages: 280, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Twenty Thousand Leagues Under the Sea", author: "Jules Verne", genre: "Adventure", year: 1870, pages: 450, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "The Jungle Book", author: "Rudyard Kipling", genre: "Adventure", year: 1894, pages: 300, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "The Call of the Wild", author: "Jack London", genre: "Adventure", year: 1903, pages: 160, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "White Fang", author: "Jack London", genre: "Adventure", year: 1906, pages: 290, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Heart of Darkness", author: "Joseph Conrad", genre: "Adventure", year: 1899, pages: 140, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Arabian Nights", author: "Unknown", genre: "Adventure", year: 1706, pages: 640, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  
  // Science Fiction
  { title: "The Time Machine", author: "H. G. Wells", genre: "Science Fiction", year: 1895, pages: 120, lang: "English", cover: "https://images.unsplash.com/photo-1509248961158-e54f6934749c" },
  { title: "The Invisible Man", author: "H. G. Wells", genre: "Science Fiction", year: 1897, pages: 160, lang: "English", cover: "https://images.unsplash.com/photo-1509248961158-e54f6934749c" },
  { title: "The War of the Worlds", author: "H. G. Wells", genre: "Science Fiction", year: 1898, pages: 200, lang: "English", cover: "https://images.unsplash.com/photo-1509248961158-e54f6934749c" },
  
  // Children's Books
  { title: "The Secret Garden", author: "Frances Hodgson Burnett", genre: "Children's Books", year: 1911, pages: 300, lang: "English", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f" },
  { title: "Black Beauty", author: "Anna Sewell", genre: "Children's Books", year: 1877, pages: 220, lang: "English", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f" },
  { title: "Grimm's Fairy Tales", author: "Jacob & Wilhelm Grimm", genre: "Children's Books", year: 1812, pages: 400, lang: "English", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f" },
  { title: "Peter Pan (Classic)", author: "J. M. Barrie", genre: "Children's Books", year: 1911, pages: 240, lang: "English", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f" },
  
  // Romance
  { title: "Little Women", author: "Louisa May Alcott", genre: "Romance", year: 1868, pages: 500, lang: "English", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f" },
  { title: "The Scarlet Letter", author: "Nathaniel Hawthorne", genre: "Romance", year: 1850, pages: 250, lang: "English", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f" },
  
  // Mythology & Poetry
  { title: "The Odyssey", author: "Homer", genre: "Mythology", year: -800, pages: 500, lang: "English (Translation)", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "The Iliad", author: "Homer", genre: "Mythology", year: -750, pages: 600, lang: "English (Translation)", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Beowulf", author: "Unknown", genre: "Poetry", year: 1000, pages: 150, lang: "Old English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "The Divine Comedy", author: "Dante Alighieri", genre: "Poetry", year: 1320, pages: 450, lang: "Italian (Translation)", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Paradise Lost", author: "John Milton", genre: "Poetry", year: 1667, pages: 300, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Leaves of Grass", author: "Walt Whitman", genre: "Poetry", year: 1855, pages: 400, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  
  // Philosophy
  { title: "The Prince", author: "Niccolò Machiavelli", genre: "Philosophy", year: 1532, pages: 140, lang: "Italian (Translation)", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Meditations", author: "Marcus Aurelius", genre: "Philosophy", year: 180, pages: 200, lang: "English (Translation)", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "The Republic", author: "Plato", genre: "Philosophy", year: -375, pages: 420, lang: "English (Translation)", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "Walden", author: "Henry David Thoreau", genre: "Philosophy", year: 1854, pages: 320, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  { title: "The Federalist Papers", author: "Hamilton, Madison & Jay", genre: "Philosophy", year: 1788, pages: 550, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" },
  
  // Drama
  { title: "The Importance of Being Earnest", author: "Oscar Wilde", genre: "Drama", year: 1895, pages: 100, lang: "English", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e" }
];

// Map 16 distinct categories with custom prices and sub-books to build up 100+ items
const CATEGORY_LIST = [
  "Classic Literature", "Mystery", "Horror", "Fantasy", "Adventure", 
  "Science Fiction", "Philosophy", "Poetry", "Children's Books", 
  "History", "Drama", "Romance", "Mythology", "Travel", "Strategy", "Education"
];

// Helper to expand catalog to 105 books programmatically
const buildExtendedCatalog = (): Book[] => {
  const catalog: Book[] = [...PRELOADED_CLASSICS];
  
  // 1. Add explicitly structured books first
  METADATA_POOL.forEach((item, index) => {
    const formatTitleId = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    catalog.push({
      id: formatTitleId,
      title: item.title,
      author: item.author,
      genre: item.genre,
      year: item.year,
      language: item.lang,
      coverUrl: `${item.cover}?auto=format&fit=crop&q=80&w=400`,
      description: `A celebrated and foundational public-domain classic of ${item.genre} written by the legendary ${item.author}, first published in ${item.year}. This premium STORYVAULT volume is restored for modern visual readers.`,
      quote: `A work of absolute genius by ${item.author}.`,
      chapters: [
        {
          title: "Chapter I: Opening Register",
          content: [
            `This is the official preview of "${item.title}" by ${item.author}.`,
            `First published in the historical year of ${item.year}, this volume represents a preserved milestone in the field of ${item.genre}.`,
            "STORYVAULT bookstore allows a complimentary 5-minute reading preview of our entire digital archive.",
            "To unlock complete transcripts, you can purchase the physical hardcover edition or download the digital eBook directly to your dashboard."
          ]
        }
      ]
    });
  });

  // 2. Programmatically fill remaining slots up to 105 books with category-specific custom metadata
  let fillIndex = 1;
  while (catalog.length < 105) {
    const category = CATEGORY_LIST[fillIndex % CATEGORY_LIST.length];
    const dummyTitle = `${category} Volume ${Math.ceil(fillIndex / CATEGORY_LIST.length)}`;
    const dummyAuthor = `Historical Author Vol. ${fillIndex}`;
    const year = 1750 + (fillIndex * 3);
    const id = `extra-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${fillIndex}`;
    
    catalog.push({
      id,
      title: dummyTitle,
      author: dummyAuthor,
      genre: category,
      year,
      language: "English",
      coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400",
      description: `An archival preservation edition of ${dummyTitle} by ${dummyAuthor}, first printed in ${year} under the category of ${category}.`,
      quote: `Wisdom from the vaults of history.`,
      chapters: [
        {
          title: "Chapter I: Introduction",
          content: [
            `Welcome to ${dummyTitle}.`,
            `This volume covers foundational records in ${category}.`,
            "STORYVAULT offers comprehensive digital previews for all of our historical collection.",
            "Order this book physically or download it instantly to read without time restrictions."
          ]
        }
      ]
    });
    fillIndex++;
  }

  // Resolve all cover URLs to authentic or fallback images
  catalog.forEach(book => {
    book.coverUrl = resolveBookCover(book);
  });

  return catalog;
};

export const CLASSICS_DATABASE: Book[] = buildExtendedCatalog();

// Decorate each book in the database with shopping parameters
export const getBookPricing = (bookId: string) => {
  const idx = CLASSICS_DATABASE.findIndex(b => b.id === bookId);
  // Deterministic prices based on the index
  const basePrice = idx > 0 ? 12.99 + (idx % 12) * 1.5 : 19.99;
  return {
    physicalPrice: Number(basePrice.toFixed(2)),
    ebookPrice: Number((basePrice * 0.35).toFixed(2))
  };
};

export const FAMOUS_QUOTES = [
  { text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", author: "Jane Austen", book: "Pride and Prejudice" },
  { text: "To Sherlock Holmes she is always *the woman*.", author: "Arthur Conan Doyle", book: "The Adventures of Sherlock Holmes" },
  { text: "I am Dracula; and I bid you welcome, Mr. Harker, to my house.", author: "Bram Stoker", book: "Dracula" },
  { text: "Curiouser and curiouser!", author: "Lewis Carroll", book: "Alice's Adventures in Wonderland" },
  { text: "All warfare is based on deception.", author: "Sun Tzu", book: "The Art of War" },
  { text: "Beware; for I am fearless, and therefore powerful.", author: "Mary Shelley", book: "Frankenstein" }
];

export const TIMELINE_EVENTS = [
  { year: 1700, title: "The Age of Reason", author: "Early Classics", description: "Public domain texts gather pace with foundational philosophy, paving the way for standard classic formats.", bookId: "art-of-war" },
  { year: 1813, title: "Pride & Prejudice Published", author: "Jane Austen", description: "A major milestone in romantic literature and satirical comedy of manners hits the shelves.", bookId: "pride-and-prejudice" },
  { year: 1818, title: "Frankenstein Emerges", author: "Mary Shelley", description: "The dawn of modern science fiction and gothic creature horror is published anonymously.", bookId: "frankenstein" },
  { year: 1865, title: "Alice Falls Down the Hole", author: "Lewis Carroll", description: "Whimsical fantasy nonsense changes children's literature forever with Alice's Adventures in Wonderland.", bookId: "alice-in-wonderland" },
  { year: 1892, title: "Sherlock Holmes Chronicles", author: "Arthur Conan Doyle", description: "Detective logic becomes popular worldwide with Holmes and Watson solving London crimes.", bookId: "sherlock-holmes" },
  { year: 1897, title: "Dracula is Born", author: "Bram Stoker", description: "The absolute height of Gothic vampire horror literature is published in Victorian England.", bookId: "dracula" }
];

export const FEATURED_AUTHORS: Author[] = [
  {
    id: "jane-austen",
    name: "Jane Austen",
    portrait: "/authors/jane-austen.webp",
    birthYear: 1775,
    deathYear: 1817,
    nationality: "British",
    biography: "English novelist known primarily for her six major novels, which critique the British landed gentry at the end of the 18th century.",
    booksWritten: 6,
    featuredBooks: ["Pride and Prejudice", "Emma", "Sense and Sensibility", "Persuasion"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "bram-stoker",
    name: "Bram Stoker",
    portrait: "/authors/bram-stoker.webp",
    birthYear: 1847,
    deathYear: 1912,
    nationality: "Irish",
    biography: "Irish author best known today for his gothic horror masterpiece Dracula, establishing the modern mythology of vampire lore in public literature.",
    booksWritten: 12,
    featuredBooks: ["Dracula"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "mary-shelley",
    name: "Mary Shelley",
    portrait: "/authors/mary-shelley.webp",
    birthYear: 1797,
    deathYear: 1851,
    nationality: "British",
    biography: "English novelist who wrote the pioneering Gothic/Sci-Fi novel Frankenstein, raising moral questions on the nature of creation, life, and death.",
    booksWritten: 7,
    featuredBooks: ["Frankenstein"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "lewis-carroll",
    name: "Lewis Carroll",
    portrait: "/authors/lewis-carroll.webp",
    birthYear: 1832,
    deathYear: 1898,
    nationality: "British",
    biography: "Pen name of Charles Lutwidge Dodgson, an English mathematician, photographer, and novelist famed for his children's tales of surreal fantasy.",
    booksWritten: 12,
    featuredBooks: ["Alice's Adventures in Wonderland", "Through the Looking-Glass"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "arthur-conan-doyle",
    name: "Arthur Conan Doyle",
    portrait: "/authors/arthur-conan-doyle.webp",
    birthYear: 1859,
    deathYear: 1930,
    nationality: "British",
    biography: "Scottish writer and physician who created the legendary detective Sherlock Holmes, establishing detective logic as a globally popular genre.",
    booksWritten: 60,
    featuredBooks: ["The Adventures of Sherlock Holmes", "The Hound of the Baskervilles", "The Sign of Four"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "hg-wells",
    name: "H. G. Wells",
    portrait: "/authors/hg-wells.webp",
    birthYear: 1866,
    deathYear: 1946,
    nationality: "British",
    biography: "English writer widely referred to as the 'father of science fiction' for his foundational speculative novels detailing alien invasion and time travel.",
    booksWritten: 50,
    featuredBooks: ["The Time Machine", "The Invisible Man", "The War of the Worlds"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "jules-verne",
    name: "Jules Verne",
    portrait: "/authors/jules-verne.webp",
    birthYear: 1828,
    deathYear: 1905,
    nationality: "French",
    biography: "French author whose adventurous Voyages extraordinaires laid the foundations for scientific speculative fiction and modern exploration tales.",
    booksWritten: 54,
    featuredBooks: ["Around the World in Eighty Days", "Journey to the Center of the Earth", "Twenty Thousand Leagues Under the Sea"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "oscar-wilde",
    name: "Oscar Wilde",
    portrait: "/authors/oscar-wilde.webp",
    birthYear: 1854,
    deathYear: 1900,
    nationality: "Irish",
    biography: "Irish poet, novelist, and wit whose brilliant plays and solo novel The Picture of Dorian Gray challenged Victorian sensibilities.",
    booksWritten: 9,
    featuredBooks: ["The Picture of Dorian Gray", "The Importance of Being Earnest"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "charles-dickens",
    name: "Charles Dickens",
    portrait: "/authors/charles-dickens.webp",
    birthYear: 1812,
    deathYear: 1870,
    nationality: "British",
    biography: "Beloved English writer and social critic who captured the harsh industrial realities and resilient characters of Victorian London.",
    booksWritten: 15,
    featuredBooks: ["Oliver Twist", "David Copperfield", "A Tale of Two Cities", "Great Expectations"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "alexandre-dumas",
    name: "Alexandre Dumas",
    portrait: "/authors/alexandre-dumas.webp",
    birthYear: 1802,
    deathYear: 1870,
    nationality: "French",
    biography: "French writer who dominated historical adventure fiction with stories of swashbuckling heroes, high drama, and epic journeys.",
    booksWritten: 100,
    featuredBooks: ["The Count of Monte Cristo", "The Three Musketeers"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "robert-louis-stevenson",
    name: "Robert Louis Stevenson",
    portrait: "/authors/robert-louis-stevenson.webp",
    birthYear: 1850,
    deathYear: 1894,
    nationality: "British",
    biography: "Scottish writer who combined literary psychological depth with thrilling adventure, writing works of horror and high-seas survival.",
    booksWritten: 13,
    featuredBooks: ["Treasure Island", "The Strange Case of Dr. Jekyll and Mr. Hyde"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "victor-hugo",
    name: "Victor Hugo",
    portrait: "/authors/victor-hugo.webp",
    birthYear: 1802,
    deathYear: 1885,
    nationality: "French",
    biography: "French literary giant of the Romantic movement whose works explored deep moral, social, and political struggles in nineteenth-century France.",
    booksWritten: 20,
    featuredBooks: ["Les Misérables"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "mark-twain",
    name: "Mark Twain",
    portrait: "/authors/mark-twain.webp",
    birthYear: 1835,
    deathYear: 1910,
    nationality: "American",
    biography: "Renowned American humorist, novelist, and lecturer whose satirical voice captured the spirit of the Mississippi River and early American frontier.",
    booksWritten: 28,
    featuredBooks: ["Adventures of Huckleberry Finn"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "homer",
    name: "Homer",
    portrait: "/authors/homer.webp",
    birthYear: -800,
    deathYear: -701,
    nationality: "Ancient Greek",
    biography: "The foundational bard of antiquity whose oral epic poetry established the myths and legendary origins of early European literature.",
    booksWritten: 2,
    featuredBooks: ["The Odyssey", "The Iliad"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "dante-alighieri",
    name: "Dante Alighieri",
    portrait: "/authors/dante-alighieri.webp",
    birthYear: 1265,
    deathYear: 1321,
    nationality: "Italian",
    biography: "Florentine poet whose Divine Comedy traced the medieval landscape of the afterlife, standardizing the vernacular Italian literary language.",
    booksWritten: 10,
    featuredBooks: ["The Divine Comedy"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "john-milton",
    name: "John Milton",
    portrait: "/authors/john-milton.webp",
    birthYear: 1608,
    deathYear: 1674,
    nationality: "British",
    biography: "English civil servant and poet whose grand biblical epic Paradise Lost explored the fall of man with unparalleled semantic gravity.",
    booksWritten: 10,
    featuredBooks: ["Paradise Lost"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "edgar-allan-poe",
    name: "Edgar Allan Poe",
    portrait: "/authors/edgar-allan-poe.webp",
    birthYear: 1809,
    deathYear: 1849,
    nationality: "American",
    biography: "American champion of the macabre, poet, and critic who pioneered the detective story and the modern psychological horror short story.",
    booksWritten: 70,
    featuredBooks: ["The Raven and Other Tales"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "daniel-defoe",
    name: "Daniel Defoe",
    portrait: "/authors/daniel-defoe.webp",
    birthYear: 1660,
    deathYear: 1731,
    nationality: "British",
    biography: "English merchant and spy whose travel journals and survival story Robinson Crusoe helped initiate the form of the English novel.",
    booksWritten: 300,
    featuredBooks: ["Robinson Crusoe"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "jonathan-swift",
    name: "Jonathan Swift",
    portrait: "/authors/jonathan-swift.webp",
    birthYear: 1667,
    deathYear: 1745,
    nationality: "Irish",
    biography: "Anglo-Irish satirist, essayist, and political writer whose Gulliver's Travels offered a scathing critique of human nature and political vanity.",
    booksWritten: 20,
    featuredBooks: ["Gulliver's Travels"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "louisa-may-alcott",
    name: "Louisa May Alcott",
    portrait: "/authors/louisa-may-alcott.webp",
    birthYear: 1832,
    deathYear: 1888,
    nationality: "American",
    biography: "American writer and advocate whose semi-autobiographical novel Little Women charted the growth and struggles of early American sisterhood.",
    booksWritten: 30,
    featuredBooks: ["Little Women"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "l-frank-baum",
    name: "L. Frank Baum",
    portrait: "/authors/l-frank-baum.webp",
    birthYear: 1856,
    deathYear: 1919,
    nationality: "American",
    biography: "American author of children's books, best known for writing The Wonderful Wizard of Oz.",
    booksWritten: 55,
    featuredBooks: ["The Wonderful Wizard of Oz"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "rudyard-kipling",
    name: "Rudyard Kipling",
    portrait: "/authors/rudyard-kipling.webp",
    birthYear: 1865,
    deathYear: 1936,
    nationality: "British",
    biography: "English novelist, short-story writer, poet, and journalist, famous for his tales of British soldiers in India and The Jungle Book.",
    booksWritten: 250,
    featuredBooks: ["The Jungle Book"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "frances-hodgson-burnett",
    name: "Frances Hodgson Burnett",
    portrait: "/authors/frances-hodgson-burnett.webp",
    birthYear: 1849,
    deathYear: 1924,
    nationality: "British-American",
    biography: "British-American novelist and playwright, best known for the classic children's novels The Secret Garden and Little Lord Fauntleroy.",
    booksWritten: 50,
    featuredBooks: ["The Secret Garden"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "jack-london",
    name: "Jack London",
    portrait: "/authors/jack-london.webp",
    birthYear: 1876,
    deathYear: 1916,
    nationality: "American",
    biography: "American novelist, journalist, and social activist, pioneer of commercial fiction and American adventure stories.",
    booksWritten: 50,
    featuredBooks: ["The Call of the Wild", "White Fang"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "herman-melville",
    name: "Herman Melville",
    portrait: "/authors/herman-melville.webp",
    birthYear: 1819,
    deathYear: 1891,
    nationality: "American",
    biography: "American author whose monumental epic Moby-Dick transformed a whaling voyage into a deep metaphysical meditation on human obsession.",
    booksWritten: 15,
    featuredBooks: ["Moby-Dick"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "miguel-de-cervantes",
    name: "Miguel de Cervantes",
    portrait: "/authors/miguel-de-cervantes.webp",
    birthYear: 1547,
    deathYear: 1616,
    nationality: "Spanish",
    biography: "Spanish novelist whose landmark satire Don Quixote ridiculed archaic chivalry and became the foundation of modern Western prose fiction.",
    booksWritten: 10,
    featuredBooks: ["Don Quixote"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "niccolo-machiavelli",
    name: "Niccolò Machiavelli",
    portrait: "/authors/niccolo-machiavelli.webp",
    birthYear: 1469,
    deathYear: 1527,
    nationality: "Italian",
    biography: "Florentine diplomat and political philosopher whose realist handbook The Prince dissected raw statecraft and political opportunism.",
    booksWritten: 5,
    featuredBooks: ["The Prince"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "sun-tzu",
    name: "Sun Tzu",
    portrait: "/authors/sun-tzu.webp",
    birthYear: -544,
    deathYear: -496,
    nationality: "Chinese",
    biography: "Ancient Chinese military general and strategist whose treatise The Art of War defined timeless principles of conflict, strategy, and leadership.",
    booksWritten: 1,
    featuredBooks: ["The Art of War"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "marcus-aurelius",
    name: "Marcus Aurelius",
    portrait: "/authors/marcus-aurelius.webp",
    birthYear: 121,
    deathYear: 180,
    nationality: "Roman",
    biography: "Stoic philosopher and Roman Emperor whose private journal Meditations offers timeless wisdom on duty, resilience, and ethical self-mastery.",
    booksWritten: 12,
    featuredBooks: ["Meditations"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  },
  {
    id: "brothers-grimm",
    name: "The Brothers Grimm",
    portrait: "/authors/brothers-grimm.webp",
    birthYear: 1785,
    deathYear: 1863,
    nationality: "German",
    biography: "German academic siblings who collected and preserved folklore and fairy tales, codifying the storytelling traditions of Western Europe.",
    booksWritten: 210,
    featuredBooks: ["Grimm's Fairy Tales"],
    createdAt: "2026-08-03T17:00:00Z",
    updatedAt: "2026-08-03T17:00:00Z"
  }
];