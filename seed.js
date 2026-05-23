const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin (Requires GOOGLE_APPLICATION_CREDENTIALS or similar setup)
// For local testing, you can specify your serviceAccountKey.json path if needed.
// e.g., var serviceAccount = require("./serviceAccountKey.json");
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const db = admin.firestore();
const products = [
    { id: 1, title: "The Midnight Library", author: "Matt Haig", price: 549, old: 699, emoji: "📗", color: "#2d6a4f", cat: "Fiction", tag: "bestseller", stars: 4.6, reviews: 2841, desc: "Between life and death, Nora Seed discovers a library containing infinite books — each one a different life she could have lived. A thought-provoking exploration of regret, hope, and the choices that define us." },
    { id: 7, title: "The Alchemist", author: "Paulo Coelho", price: 350, old: 420, emoji: "✨", color: "#b5830a", cat: "Fiction", tag: "sale", stars: 4.5, reviews: 6812, desc: "A young Andalusian shepherd named Santiago embarks on a journey to find a hidden treasure near the Egyptian pyramids. Paulo Coelho's timeless fable about following your dreams has inspired millions worldwide." },
    { id: 16, title: "To Kill a Mockingbird", author: "Harper Lee", price: 480, old: null, emoji: "🐦", color: "#7b4f2e", cat: "Fiction", tag: "bestseller", stars: 4.7, reviews: 7341, desc: "Through the eyes of young Scout Finch, we witness her father Atticus defend a Black man falsely accused of a crime in 1930s Alabama. Harper Lee's Pulitzer Prize-winning novel remains a timeless testament to justice and moral courage." },
    { id: 17, title: "1984", author: "George Orwell", price: 420, old: 520, emoji: "👁️", color: "#1a1a2e", cat: "Fiction", tag: "sale", stars: 4.7, reviews: 8904, desc: "In a totalitarian superstate where Big Brother watches everything, Winston Smith dares to think forbidden thoughts. George Orwell's chilling dystopia is more relevant today than ever — a warning about power, surveillance, and truth." },
    { id: 18, title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 390, old: null, emoji: "🥂", color: "#c9a227", cat: "Fiction", tag: "new", stars: 3.9, reviews: 5503, desc: "Jay Gatsby throws lavish parties at his Long Island mansion, all in pursuit of the elusive Daisy Buchanan. F. Scott Fitzgerald's glittering tragedy captures the promise and peril of the American Dream." },
    { id: 24, title: "Pride and Prejudice", author: "Jane Austen", price: 360, old: 450, emoji: "🌸", color: "#c77daa", cat: "Romance", tag: "sale", stars: 4.8, reviews: 6120, desc: "The spirited Elizabeth Bennet clashes with the proud Mr. Darcy in Regency-era England, where first impressions can be dangerously misleading. Jane Austen's beloved masterpiece is the ultimate romance of wit, misunderstanding, and true love." },
    { id: 8, title: "Project Hail Mary", author: "Andy Weir", price: 710, old: null, emoji: "🚀", color: "#0077b6", cat: "Sci-Fi", tag: "new", stars: 4.8, reviews: 1543, desc: "Ryland Grace wakes up alone on a spaceship with no memory, millions of miles from home, tasked with saving humanity from extinction. Andy Weir delivers a thrilling, witty adventure full of science, heart, and an unforgettable alien friendship." },
    { id: 15, title: "The Hitchhiker's Guide", author: "Douglas Adams", price: 380, old: 480, emoji: "🪐", color: "#023e8a", cat: "Sci-Fi", tag: "sale", stars: 4.5, reviews: 4109, desc: "Arthur Dent's ordinary Thursday takes a turn when Earth is demolished to make way for a hyperspace bypass. Douglas Adams' beloved comedy is a wildly inventive, laugh-out-loud romp through the absurdity of the universe." },
    { id: 19, title: "Ender's Game", author: "Orson Scott Card", price: 560, old: null, emoji: "🎮", color: "#3d405b", cat: "Sci-Fi", tag: "bestseller", stars: 4.6, reviews: 3780, desc: "Brilliant child strategist Ender Wiggin is recruited to a military academy in space to prepare for an alien war. Orson Scott Card delivers a gripping, thought-provoking tale of leadership, morality, and the cost of victory." },
    { id: 4, title: "The Name of the Wind", author: "Patrick Rothfuss", price: 590, old: null, emoji: "🌙", color: "#4a1942", cat: "Fantasy", tag: "new", stars: 4.7, reviews: 1987, desc: "Kvothe — legend, musician, and feared magician — tells his own extraordinary story from humble beginnings to infamy. Patrick Rothfuss crafts a lush, intricate fantasy that redefines the genre." },
    { id: 11, title: "Fourth Wing", author: "Rebecca Yarros", price: 820, old: null, emoji: "🐉", color: "#6b2d2d", cat: "Fantasy", tag: "new", stars: 4.7, reviews: 2654, desc: "Twenty-year-old Violet Sorrengail is forced into the brutal dragon riders' academy where survival is never guaranteed. Rebecca Yarros ignites a breathtaking fantasy filled with fierce dragons, deadly war games, and forbidden romance." },
    { id: 5, title: "Gone Girl", author: "Gillian Flynn", price: 420, old: 550, emoji: "🔍", color: "#2b2d42", cat: "Mystery", tag: "sale", stars: 4.0, reviews: 2103, desc: "On their fifth wedding anniversary, Nick Dunne's wife Amy disappears — and suspicion quickly falls on him. Gillian Flynn's razor-sharp thriller twists perception and trust into a dark, unforgettable puzzle." },
    { id: 21, title: "And Then There Were None", author: "Agatha Christie", price: 370, old: null, emoji: "🕵️", color: "#1c1c1c", cat: "Mystery", tag: "bestseller", stars: 4.8, reviews: 5672, desc: "Ten strangers are lured to a remote island, and one by one they begin to die according to a sinister nursery rhyme. Agatha Christie's masterpiece remains the greatest mystery novel ever written." },
    { id: 2, title: "Atomic Habits", author: "James Clear", price: 620, old: null, emoji: "💪", color: "#e07c24", cat: "Self-Help", tag: "bestseller", stars: 4.8, reviews: 4520, desc: "James Clear reveals how tiny changes in your daily habits can lead to remarkable results over time. Packed with proven strategies and real-world examples, this is the ultimate guide to breaking bad habits and building good ones." },
    { id: 22, title: "Think and Grow Rich", author: "Napoleon Hill", price: 440, old: 550, emoji: "💡", color: "#d4af37", cat: "Self-Help", tag: "sale", stars: 4.2, reviews: 3910, desc: "Napoleon Hill distills decades of research into thirteen principles for achieving success and wealth. This timeless classic has guided millions toward financial independence through the power of desire, faith, and persistence." },
    { id: 9, title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", price: 495, old: null, emoji: "💼", color: "#2c6e49", cat: "Business", tag: "bestseller", stars: 4.3, reviews: 3870, desc: "Robert Kiyosaki shares the contrasting money lessons he learned from his two 'dads' — one rich, one poor. This personal finance classic challenges conventional wisdom about wealth and teaches you to make money work for you." },
    { id: 12, title: "The Psychology of Money", author: "Morgan Housel", price: 555, old: null, emoji: "🧠", color: "#264653", cat: "Business", tag: "new", stars: 4.6, reviews: 3101, desc: "Morgan Housel explores the strange ways people think about money through 19 short stories of real-world behavior. A fascinating, accessible guide to understanding wealth, greed, and happiness." },
    { id: 6, title: "Sapiens", author: "Yuval Noah Harari", price: 680, old: null, emoji: "🌍", color: "#386641", cat: "History", tag: "bestseller", stars: 4.7, reviews: 5214, desc: "Yuval Noah Harari sweeps through 70,000 years of human history, from the Stone Age to the Silicon Age. A bold, provocative exploration of how Homo sapiens came to dominate the Earth and what it means for our future." },
    { id: 14, title: "Educated", author: "Tara Westover", price: 510, old: null, emoji: "🎓", color: "#5f4b8b", cat: "History", tag: "bestseller", stars: 4.8, reviews: 1923, desc: "Born to survivalists in rural Idaho, Tara Westover had no formal education until she taught herself enough to earn a PhD from Cambridge. A raw, powerful memoir about the transformative power of learning." },
    { id: 10, title: "It Ends with Us", author: "Colleen Hoover", price: 460, old: 580, emoji: "❤️", color: "#c1121f", cat: "Romance", tag: "sale", stars: 4.6, reviews: 4210, desc: "Lily Bloom moves to Boston and falls for charming neurosurgeon Ryle Kincaid, but nothing is ever as perfect as it seems. Colleen Hoover delivers a courageous, heart-wrenching story about love, strength, and impossible choices." },
    { id: 23, title: "The Notebook", author: "Nicholas Sparks", price: 400, old: null, emoji: "🕊️", color: "#457b9d", cat: "Romance", tag: "new", stars: 4.4, reviews: 3280, desc: "In a nursing home, an elderly man reads a faded notebook to a woman whose memory is slipping away — a love story that began decades ago. Nicholas Sparks' debut novel is a tender, unforgettable celebration of enduring love." },
    { id: 30, title: "Jujutsu Kaisen Vol. 1", author: "Gege Akutami", price: 295, old: null, emoji: "⚡", color: "#1a1a2e", cat: "Manga", tag: "bestseller", stars: 4.9, reviews: 8210, desc: "Follow Yuji Itadori as he's thrust into the dangerous world of jujutsu sorcerers after swallowing a cursed finger of the legendary demon Sukuna." },
    { id: 31, title: "Demon Slayer Vol. 1", author: "Koyoharu Gotouge", price: 285, old: 320, emoji: "🗡️", color: "#8b1a1a", cat: "Manga", tag: "sale", stars: 4.9, reviews: 9540, desc: "Tanjiro Kamado's peaceful life is shattered when his family is slaughtered by a demon. His sister Nezuko, the sole survivor, has been transformed into a demon herself." },
    { id: 32, title: "One Piece Vol. 1", author: "Eiichiro Oda", price: 275, old: null, emoji: "☠️", color: "#e07c24", cat: "Manga", tag: "bestseller", stars: 4.9, reviews: 12300, desc: "Monkey D. Luffy sets sail to find the legendary treasure One Piece and become King of the Pirates. A timeless adventure across the Grand Line." },
    { id: 33, title: "Attack on Titan Vol. 1", author: "Hajime Isayama", price: 310, old: null, emoji: "🔥", color: "#2b2d42", cat: "Manga", tag: "new", stars: 4.8, reviews: 10150, desc: "Humanity fights for survival against giant humanoid Titans. Eren Yeager vows revenge after witnessing the destruction of his hometown." },
    { id: 34, title: "My Hero Academia Vol. 1", author: "Kōhei Horikoshi", price: 295, old: 340, emoji: "💥", color: "#2563eb", cat: "Manga", tag: "sale", stars: 4.8, reviews: 7890, desc: "In a world where most humans have superpowers, Izuku Midoriya dreams of becoming a hero — despite being born without any abilities." },
    { id: 35, title: "Solo Leveling Vol. 1", author: "Chugong & DUBU", price: 420, old: null, emoji: "⚔️", color: "#312e81", cat: "Manhwa", tag: "bestseller", stars: 4.9, reviews: 11200, desc: "Sung Jin-Woo is the weakest hunter alive — until a strange double dungeon awakens a hidden power and transforms him into the strongest." },
    { id: 36, title: "Tower of God Vol. 1", author: "SIU (Lee Jong-hui)", price: 380, old: 460, emoji: "🏯", color: "#064e3b", cat: "Manhwa", tag: "sale", stars: 4.7, reviews: 6780, desc: "A boy named Twenty-Fifth Bam enters a mysterious tower to find his only friend Rachel, facing impossible tests on every floor." },
    { id: 37, title: "True Beauty Vol. 1", author: "Yaongyi", price: 360, old: null, emoji: "✨", color: "#be185d", cat: "Manhwa", tag: "new", stars: 4.3, reviews: 5340, desc: "Im Jukyung hides her bare face behind expert makeup skills — until two boys discover her secret in different ways." },
    { id: 38, title: "Lookism Vol. 1", author: "Park Tae-jun", price: 340, old: 400, emoji: "👀", color: "#374151", cat: "Manhwa", tag: "sale", stars: 4.1, reviews: 4120, desc: "Daniel Park wakes up in a new handsome body, experiencing how drastically society treats people based on looks." },
    { id: 39, title: "After", author: "Anna Todd", price: 445, old: 520, emoji: "📖", color: "#7c3aed", cat: "Wattpad", tag: "bestseller", stars: 3.8, reviews: 14500, desc: "Tessa Young, a dedicated student, meets the tattooed and troubled Hardin Scott when she starts college — the most popular Wattpad story ever published." },
    { id: 40, title: "The Kissing Quotient", author: "Helen Hoang", price: 420, old: null, emoji: "💕", color: "#db2777", cat: "Wattpad", tag: "new", stars: 4.2, reviews: 8800, desc: "Stella Lane, an econometrician with Autism Spectrum Disorder, decides to hire a male escort to get the relationship experience she lacks." },
    { id: 41, title: "Royals (The Royals #1)", author: "Rachel Hawkins", price: 395, old: 450, emoji: "👑", color: "#b45309", cat: "Wattpad", tag: "sale", stars: 3.9, reviews: 6200, desc: "Daisy Winters is an American girl who finds herself thrust into the world of British royalty when her sister gets engaged to a prince." },
    { id: 42, title: "Leatherbound Classic Journal", author: "Readora", price: 450, old: 550, emoji: "📓", color: "#8b4513", cat: "Stationery", tag: "bestseller", stars: 4.6, reviews: 312, desc: "Hand-stitched genuine leather cover with 240 acid-free, ivory pages. Ribbon bookmark, lay-flat binding, and a back pocket for loose notes. The perfect companion for daily journaling, brainstorming, or sketching your next big idea." },
    { id: 43, title: "Minimalist Hardcover Planner", author: "Readora", price: 380, old: null, emoji: "📅", color: "#2d3748", cat: "Stationery", tag: "new", stars: 4.3, reviews: 185, desc: "Undated weekly + monthly planner with habit trackers, priority matrices, and reflection prompts. Matte black hardcover with gold-foil detailing and elastic closure. Start any time of year — no wasted pages, no pressure." },
    { id: 44, title: "Vintage Fountain Pen Set", author: "Kaweco", price: 690, old: 850, emoji: "🖊️", color: "#1a1a2e", cat: "Stationery", tag: "sale", stars: 4.7, reviews: 520, desc: "A set of two premium fountain pens — one in midnight navy, one in brushed gunmetal — with medium nibs that glide effortlessly on paper. Includes 12 ink cartridges (6 colors) and a leather carry pouch. Makes an exceptional gift for writers and collectors." },
    { id: 45, title: "Washi Tape Collection (Pastel)", author: "Readora", price: 150, old: null, emoji: "🎀", color: "#fdfd96", cat: "Stationery", tag: "", stars: 4.1, reviews: 89, desc: "A curated set of 8 pastel washi tapes — soft pinks, sage greens, dusty blues, and warm creams. 15mm wide, easy-tear, repositionable adhesive that won't damage paper. Perfect for bullet journals, scrapbooks, gift wrapping, or decorating your planner spreads." },
    { id: 46, title: "Signature Canvas Tote Bag", author: "Readora", price: 250, old: null, emoji: "👜", color: "#f5f5dc", cat: "Stationery", tag: "bestseller", stars: 4.8, reviews: 741, desc: "Heavy-duty 12oz natural canvas tote with reinforced handles, a zippered inner pocket, and the Readora logo embroidered in black thread. Fits up to 4 standard paperbacks plus your journal and water bottle. Proudly made from 100% unbleached cotton." },
    { id: 100, title: "Readora Bookmark Set (6pcs)", author: "Readora", price: 95, old: null, emoji: "🔖", color: "#c9a227", cat: "Stationery", tag: "new", stars: 4.5, reviews: 203, desc: "A set of 6 hand-illustrated magnetic bookmarks featuring iconic literary scenes — a Parisian café, a candlelit study, a midnight garden, and more. Strong rare-earth magnets that never fall off, printed on 350gsm matte card with a linen texture." },
    { id: 101, title: "Brass Page Magnifier Loupe", author: "Readora", price: 320, old: 420, emoji: "🔍", color: "#b08004", cat: "Stationery", tag: "sale", stars: 4.2, reviews: 78, desc: "A 3× magnification glass loupe in solid brushed brass with a leather carry sleeve. Designed for fine-print reading, map navigation, and inspecting illustrations in art books. A beautiful desk accessory that doubles as a collector's piece." },
    { id: 102, title: "Sticky Note Collection (Pastel)", author: "Readora", price: 120, old: null, emoji: "🗒️", color: "#fdfd96", cat: "Stationery", tag: "new", stars: 4.0, reviews: 156, desc: "Five pads of 80-sheet sticky notes in sage, blush, sky, cream, and lavender. Acid-free adhesive that repositions without residue. Works on book pages, whiteboards, and monitor frames. Essential for annotating, brainstorming, and color-coded planning." },
    { id: 103, title: "Reading Light Clip (USB)", author: "Readora", price: 180, old: 240, emoji: "💡", color: "#2d3748", cat: "Stationery", tag: "sale", stars: 4.6, reviews: 445, desc: "A flexible neck LED reading light with a sturdy book-clip base. Three brightness levels, warm to cool white. USB-C rechargeable — a single charge lasts 40 hours at low brightness. Compact enough to travel in a pocket, bright enough for late-night reading without disturbing others." },
    { id: 104, title: "Readora Tote + Journal Bundle", author: "Readora", price: 650, old: 750, emoji: "🎁", color: "#8b4513", cat: "Stationery", tag: "bestseller", stars: 4.9, reviews: 312, desc: "Our best-selling canvas tote paired with the Leatherbound Classic Journal in a gift-ready kraft box with ribbon. The perfect bundle for a new reader, a graduating student, or anyone who deserves something beautiful. Personalization available — add a name or quote inside the journal cover." },
    { id: 47, title: "A Court of Thorns and Roses", author: "Sarah J. Maas", price: 799, old: null, emoji: "🌹", color: "#b5446e", cat: "Fantasy", tag: "bestseller", stars: 4.4, reviews: 24300, isBestseller: true, discountPrice: 24.99, desc: "A survivalist huntress is swept into a world of immortal faeries and ancient curses after killing a wolf in the woods. What begins as captivity slowly transforms into something far more dangerous as mortal and fae worlds collide." },
    { id: 48, title: "A Court of Mist and Fury", author: "Sarah J. Maas", price: 799, old: null, emoji: "🌙", color: "#3b1f5e", cat: "Fantasy", tag: "bestseller", stars: 4.8, reviews: 22100, isBestseller: true, discountPrice: 24.99, desc: "Feyre escapes the treacherous Spring Court only to find herself in the glittering, perilous Night Court ruled by the most powerful High Lord in history. As buried truths about her own power surface, she must decide where her loyalties — and her heart — truly lie." },
    { id: 49, title: "A Court of Wings and Ruin", author: "Sarah J. Maas", price: 820, old: null, emoji: "🦋", color: "#1e3a5f", cat: "Fantasy", tag: "bestseller", stars: 4.5, reviews: 19800, isBestseller: true, discountPrice: 24.99, desc: "War looms over Prythian as Feyre and her allies must face the King of Hybern to save both the human and faerie worlds. Every alliance will be tested, every secret exposed, and every sacrifice may prove final." },
    { id: 50, title: "A Court of Frost and Starlight", author: "Sarah J. Maas", price: 650, old: null, emoji: "❄️", color: "#1c4f72", cat: "Fantasy", tag: "bestseller", stars: 4.2, reviews: 14500, isBestseller: true, discountPrice: 24.99, desc: "A short, luminous bridge between the war's end and a new beginning, following Feyre and Rhysand as they rebuild Velaris and navigate the scars — seen and unseen — left behind. Perfect for fans who need just a little more time in the Night Court before the series pivots." },
    { id: 51, title: "A Court of Silver Flames", author: "Sarah J. Maas", price: 850, old: null, emoji: "🔥", color: "#7c1d1d", cat: "Fantasy", tag: "bestseller", stars: 4.6, reviews: 18900, isBestseller: true, discountPrice: 24.99, desc: "Cassian and Nesta are forced into an uneasy cohabitation, each carrying wounds from the war that never fully healed. Their fiery antagonism masks a connection neither can deny, set against a mounting threat from a new, deadly enemy." },
    { id: 52, title: "A Game of Thrones", author: "George R.R. Martin", price: 780, old: null, emoji: "🐺", color: "#1a1a1a", cat: "Fantasy", tag: "bestseller", stars: 4.7, reviews: 15900, isBestseller: true, discountPrice: 24.99, desc: "Noble houses maneuver for control of the Iron Throne while an ancient, icy threat rises in the forgotten North. The game of thrones is brutal, and in this world, you either win or you die." },
    { id: 53, title: "A Clash of Kings", author: "George R.R. Martin", price: 750, old: 890, emoji: "👑", color: "#7c2d12", cat: "Fantasy", tag: "bestseller", stars: 4.6, reviews: 10400, isBestseller: true, discountPrice: 24.99, desc: "As Robb Stark wages war in the south and Daenerys crosses the Red Waste in the east, no corner of Westeros escapes the drumbeat of war. New claimants rise, old alliances shatter, and the realm bleeds for ambition." },
    { id: 54, title: "A Storm of Swords", author: "George R.R. Martin", price: 820, old: null, emoji: "⚔️", color: "#2c2c2c", cat: "Fantasy", tag: "bestseller", stars: 4.8, reviews: 13200, isBestseller: true, discountPrice: 24.99, desc: "The War of the Five Kings reaches its most devastating crescendo, delivering betrayals so seismic readers still talk about them decades later. Martin stretches his canvas to its widest yet, and the result is epic fantasy at its most unforgiving." },
    { id: 55, title: "A Feast for Crows", author: "George R.R. Martin", price: 720, old: null, emoji: "🌊", color: "#0c3547", cat: "Fantasy", tag: "bestseller", stars: 4.1, reviews: 8700, isBestseller: true, discountPrice: 24.99, desc: "The aftermath of war is uglier than the war itself, as power vacuums breed new predators and familiar faces are tested to their limits. A slower, deeply character-driven entry that rewards patient readers with rich political intrigue." },
    { id: 56, title: "A Dance with Dragons", author: "George R.R. Martin", price: 780, old: null, emoji: "🐉", color: "#1a3300", cat: "Fantasy", tag: "bestseller", stars: 4.5, reviews: 11200, isBestseller: true, discountPrice: 24.99, desc: "Across the Narrow Sea, Daenerys struggles to hold Meereen while Tyrion navigates a treacherous world in exile. Long-separated storylines begin their fateful collision as winter's arrival can no longer be denied." },
    { id: 57, title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", price: 699, old: null, emoji: "⚡", color: "#7c3aed", cat: "Fantasy", tag: "bestseller", stars: 4.9, reviews: 29400, isBestseller: true, discountPrice: 24.99, desc: "An orphaned boy discovers his magical heritage and attends a school for wizards, facing the dark sorcerer who upended his life. A world of wonder built brick by enchanted brick — the beginning of a generation-defining saga." },
    { id: 58, title: "Harry Potter and the Chamber of Secrets", author: "J.K. Rowling", price: 699, old: null, emoji: "🐍", color: "#166534", cat: "Fantasy", tag: "bestseller", stars: 4.7, reviews: 18200, isBestseller: true, discountPrice: 24.99, desc: "Sinister voices in the walls, petrified students, and a legend of a Chamber that should never have been opened cast a shadow over Harry's second year at Hogwarts. The mystery deepens and the stakes rise in this darker, more confident sequel." },
    { id: 59, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 720, old: null, emoji: "🦅", color: "#1e3a5f", cat: "Fantasy", tag: "bestseller", stars: 4.9, reviews: 21700, isBestseller: true, discountPrice: 24.99, desc: "A notorious prisoner escapes Azkaban and is believed to be hunting Harry, forcing a year shadowed by Dementors and dangerous secrets. The twists in the final act reframe everything that came before in the best possible way." },
    { id: 60, title: "Harry Potter and the Goblet of Fire", author: "J.K. Rowling", price: 750, old: null, emoji: "🏆", color: "#78350f", cat: "Fantasy", tag: "bestseller", stars: 4.8, reviews: 20100, isBestseller: true, discountPrice: 24.99, desc: "Harry is thrust into the deadly Triwizard Tournament — a competition he never entered — while Voldemort's servants grow bolder in the shadows. The book that first made clear just how dark this series was always going to get." },
    { id: 61, title: "Harry Potter and the Order of the Phoenix", author: "J.K. Rowling", price: 780, old: null, emoji: "🦅", color: "#1f2937", cat: "Fantasy", tag: "bestseller", stars: 4.5, reviews: 19500, isBestseller: true, discountPrice: 24.99, desc: "Dismissed by the Ministry and plagued by disturbing visions, Harry forms Dumbledore's Army to resist a regime that would rather silence the truth than face it. The longest and most emotionally raw entry in the series, culminating in a loss that changes everything." },
    { id: 62, title: "Harry Potter and the Half-Blood Prince", author: "J.K. Rowling", price: 750, old: null, emoji: "🧙", color: "#312e81", cat: "Fantasy", tag: "bestseller", stars: 4.7, reviews: 18800, isBestseller: true, discountPrice: 24.99, desc: "As war consumes the wizarding world, Harry and Dumbledore race to uncover the secrets of Voldemort's past and the keys to his destruction. A chapter of heartbreak and revelation that makes the final confrontation feel inevitable." },
    { id: 63, title: "Harry Potter and the Deathly Hallows", author: "J.K. Rowling", price: 780, old: null, emoji: "💀", color: "#111827", cat: "Fantasy", tag: "bestseller", stars: 4.8, reviews: 23600, isBestseller: true, discountPrice: 24.99, desc: "The horcrux hunt goes beyond Hogwarts as Harry, Ron, and Hermione risk everything to dismantle Voldemort's immortality. A triumphant, bittersweet finale that earns every emotion it asks the reader to feel." },
    { id: 64, title: "Dune", author: "Frank Herbert", price: 680, old: null, emoji: "🏜️", color: "#92400e", cat: "Sci-Fi", tag: "bestseller", stars: 4.9, reviews: 16800, isBestseller: true, discountPrice: 24.99, desc: "On the desert planet Arrakis — the only source of the universe's most precious substance — a young nobleman must navigate betrayal, prophecy, and survival. A sweeping masterwork of ecology, politics, and myth that redefined what science fiction could be." },
    { id: 65, title: "The Hobbit", author: "J.R.R. Tolkien", price: 599, old: null, emoji: "💍", color: "#44403c", cat: "Fantasy", tag: "bestseller", stars: 4.9, reviews: 18500, isBestseller: true, discountPrice: 24.99, desc: "A comfort-loving hobbit is recruited by a wizard and thirteen dwarves on an improbable quest to reclaim a mountain from a dragon. Tolkien's warmest and most adventurous tale, the perfect entry point to Middle-earth." }
];

const coverImages = {
    1: 'https://books.google.com/books/content?id=M53SDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    2: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
    4: 'https://books.google.com/books/content?id=OlmJEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    5: 'https://books.google.com/books/content?id=C4J6zgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    6: 'https://books.google.com/books/content?id=PPdZswEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    7: 'https://books.google.com/books/content?id=FEL8DlqjYEkC&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    8: 'https://books.google.com/books/content?id=-Ff2DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    9: 'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg',
    10: 'https://books.google.com/books/content?id=UnIQEQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    11: 'https://books.google.com/books/content?id=E-OLEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    12: 'https://books.google.com/books/content?id=TnrrDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    14: 'https://books.google.com/books/content?id=LZG4uAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    15: 'https://books.google.com/books/content?id=gNwQpoCxe0QC&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    16: 'https://covers.openlibrary.org/b/id/12784310-L.jpg',
    17: 'https://books.google.com/books/content?id=tSJIEQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    18: 'https://books.google.com/books/content?id=0yfauGsKOjAC&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    19: 'https://books.google.com/books/content?id=_ZghmgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    21: 'https://books.google.com/books/content?id=gAD4EAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    22: 'https://covers.openlibrary.org/b/isbn/9781585424337-L.jpg',
    23: 'https://covers.openlibrary.org/b/isbn/9780446605236-L.jpg',
    24: 'https://books.google.com/books/content?id=repIAwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    30: 'productimg/jujutsu.jpg',
    31: 'https://books.google.com/books/content?id=OINZDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    32: 'https://covers.openlibrary.org/b/isbn/9781569319017-L.jpg',
    33: 'https://books.google.com/books/content?id=0QPzDQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    34: 'https://covers.openlibrary.org/b/isbn/9781421582696-L.jpg',
    35: 'https://covers.openlibrary.org/b/isbn/9781975319397-L.jpg',
    36: 'https://covers.openlibrary.org/b/isbn/9781990259906-L.jpg',
    37: 'https://books.google.com/books/content?id=ozOB0QEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    38: 'https://covers.openlibrary.org/b/isbn/9791133428854-L.jpg',
    39: 'https://books.google.com/books/content?id=QVLRBAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    40: 'https://covers.openlibrary.org/b/isbn/9781250196781-L.jpg',
    41: 'https://covers.openlibrary.org/b/isbn/9781524738228-L.jpg',
    42: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&q=80',
    43: 'https://images.unsplash.com/photo-1506784926709-22f1ec395907?w=300&q=80',
    44: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=300&q=80',
    45: 'https://images.unsplash.com/photo-1600431521340-491eca880813?w=300&q=80',
    46: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=300&q=80',
    100: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&q=80',
    101: 'https://images.unsplash.com/photo-1616628188859-7a11abb6fcc9?w=300&q=80',
    102: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&q=80',
    103: 'https://images.unsplash.com/photo-1524578271613-d7f9c7640f07?w=300&q=80',
    104: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=300&q=80',
    47: 'productimg/courtofthornsandroses.jpg',
    48: 'productimg/a-court-of-mist-and-fury-.jpg',
    49: 'productimg/wingsandruin.jpeg',
    50: 'productimg/frostandstarlight.jpg',
    51: 'productimg/silverflames.jpg',
    52: 'https://covers.openlibrary.org/b/isbn/9780553573404-L.jpg',
    53: 'https://covers.openlibrary.org/b/isbn/9780553579901-L.jpg',
    54: 'https://covers.openlibrary.org/b/isbn/9780553573428-L.jpg',
    55: 'https://covers.openlibrary.org/b/isbn/9780553801507-L.jpg',
    56: 'https://covers.openlibrary.org/b/isbn/9780553582017-L.jpg',
    57: 'https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg',
    58: 'productimg/chamber.jpg',
    59: 'https://covers.openlibrary.org/b/isbn/9780439655484-L.jpg',
    60: 'https://covers.openlibrary.org/b/isbn/9780439139601-L.jpg',
    61: 'https://covers.openlibrary.org/b/isbn/9780439358071-L.jpg',
    62: 'https://covers.openlibrary.org/b/isbn/9780439785969-L.jpg',
    63: 'productimg/deathly.jpg',
    64: 'https://covers.openlibrary.org/b/id/8231117-L.jpg',
    65: 'https://covers.openlibrary.org/b/id/9255566-L.jpg',
};

const seedDB = async () => {
    try {
        console.log('Connected to Firestore for seeding...');

        // 1. Seed Books Collection
        console.log('Seeding books collection...');
        let booksCount = 0;
        for (const p of products) {
            const stock = Math.floor(Math.random() * (50 - 15 + 1)) + 15; // Random 15-50
            const lowStock = stock <= 5;

            const bookData = {
                title: p.title,
                author: p.author,
                price: p.price,
                oldPrice: p.old,
                emoji: p.emoji,
                color: p.color,
                category: p.cat,
                tag: p.tag,
                stars: p.stars,
                reviews: p.reviews,
                description: p.desc,
                imageUrl: coverImages[p.id] || '',
                isBestseller: p.isBestseller || false,
                discountPrice: p.discountPrice || null,
                stock: stock,
                lowStock: lowStock
            };

            await db.collection('books').doc(p.id.toString()).set(bookData, { merge: true });
            booksCount++;
        }
        console.log(`Seeded ${booksCount} books successfully!`);

        // 2. Seed Promo Codes Collection
        console.log('Seeding promoCodes collection...');
        const promos = [
            { id: "READ10", discount: 100, type: "fixed", active: true, expiry: null },
            { id: "READORA10", discount: 10, type: "percent", active: true, expiry: null },
            { id: "JOURNAL20", discount: 80, type: "fixed", active: true, expiry: null },
            { id: "READGIFT", discount: 100, type: "fixed", active: true, expiry: null },
            { id: "STATFREE", discount: 50, type: "fixed", active: true, expiry: null }
        ];

        let promoCount = 0;
        for (const promo of promos) {
            const promoData = { ...promo };
            delete promoData.id; // use id as document id
            await db.collection('promoCodes').doc(promo.id).set(promoData, { merge: true });
            promoCount++;
        }
        console.log(`Seeded ${promoCount} promo codes successfully!`);

        console.log('Seeding complete! You can exit (Ctrl+C).');
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
