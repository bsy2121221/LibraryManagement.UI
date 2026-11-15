// Building blocks the admin can place on the home page (the header and footer are fixed and not blocks).
// The API accepts exactly these `type` values (HomePageService.BlockTypes) - keep both lists in sync.
//
// Field types used by the editor form:
//   text | multiline | link | image | select (options) | items (a repeating list with itemFields)
// Text fields may use {LibraryName} and {MonthlyFee}; they are filled in when the page is shown.

export const ICON_OPTIONS = [
  { value: 'seat', label: 'Seat' },
  { value: 'ac', label: 'Air conditioning' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'shield', label: 'Safety' },
  { value: 'book', label: 'Books' },
  { value: 'clock', label: 'Timing' },
  { value: 'lock', label: 'Locker' },
  { value: 'power', label: 'Charging point' },
  { value: 'coffee', label: 'Tea / coffee' },
  { value: 'cctv', label: 'CCTV' },
  { value: 'parking', label: 'Parking' },
  { value: 'water', label: 'Drinking water' },
  { value: 'light', label: 'Lighting' },
  { value: 'quiet', label: 'Silent zone' },
]

const ALIGN = { key: 'align', label: 'Text alignment', type: 'select', options: [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
] }

const BACKGROUND = { key: 'background', label: 'Background', type: 'select', options: [
  { value: 'white', label: 'White' },
  { value: 'light', label: 'Light grey' },
  { value: 'tint', label: 'Light blue' },
] }

const COLUMNS = { key: 'columns', label: 'Columns on large screens', type: 'select', options: [
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
] }

const BUTTON = [
  { key: 'buttonText', label: 'Button text', type: 'text', help: 'Leave empty for no button' },
  { key: 'buttonLink', label: 'Button link', type: 'link' },
]

export const BLOCK_TYPES = {
  hero: {
    label: 'Banner',
    description: 'Big heading with a background picture and buttons. Best as the first block.',
    fields: [
      { key: 'eyebrow', label: 'Small text above the heading', type: 'text' },
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'subtitle', label: 'Text below the heading', type: 'multiline' },
      ...BUTTON,
      { key: 'secondaryButtonText', label: 'Second button text', type: 'text', help: 'Optional' },
      { key: 'secondaryButtonLink', label: 'Second button link', type: 'link' },
      { key: 'image', label: 'Background picture', type: 'image', help: 'Without a picture a blue gradient is used' },
      ALIGN,
      { key: 'height', label: 'Height', type: 'select', options: [
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ] },
    ],
    defaults: {
      eyebrow: '{LibraryName}',
      title: 'A calm place to focus',
      subtitle: 'Book your seat in our study library in a minute. See which seats are free and reserve yours online for just {MonthlyFee} a month.',
      buttonText: 'See available seats',
      buttonLink: '/seats',
      secondaryButtonText: '',
      secondaryButtonLink: '',
      image: '',
      align: 'left',
      height: 'large',
    },
  },

  features: {
    label: 'Facilities',
    description: 'Cards with an icon, a title and a short text.',
    fields: [
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'subtitle', label: 'Text below the heading', type: 'multiline' },
      COLUMNS,
      BACKGROUND,
      {
        key: 'items', label: 'Facilities', type: 'items', itemLabel: 'Facility', titleKey: 'title', max: 12,
        itemFields: [
          { key: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'text', label: 'Text', type: 'multiline' },
        ],
        newItem: { icon: 'seat', title: 'New facility', text: '' },
      },
    ],
    defaults: {
      title: 'Why study with us',
      subtitle: '',
      columns: 4,
      background: 'white',
      items: [
        { icon: 'seat', title: 'Your own seat', text: 'Pick a fixed seat that stays yours every month.' },
        { icon: 'ac', title: 'Comfortable', text: 'Air-conditioned, quiet and well lit study halls.' },
        { icon: 'wifi', title: 'High-speed Wi-Fi', text: 'Stay connected for online classes and research.' },
        { icon: 'shield', title: 'Separate sections', text: 'Dedicated sections for boys and girls.' },
      ],
    },
  },

  text: {
    label: 'Text',
    description: 'A heading and paragraphs.',
    fields: [
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'body', label: 'Text', type: 'multiline', rows: 6 },
      ALIGN,
      BACKGROUND,
    ],
    defaults: { title: 'About us', body: 'Write something about your library here.', align: 'center', background: 'white' },
  },

  imageText: {
    label: 'Picture + text',
    description: 'A picture next to a heading, text and a button.',
    fields: [
      { key: 'image', label: 'Picture', type: 'image' },
      { key: 'imagePosition', label: 'Picture position', type: 'select', options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ] },
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'body', label: 'Text', type: 'multiline', rows: 5 },
      ...BUTTON,
      BACKGROUND,
    ],
    defaults: {
      image: '',
      imagePosition: 'left',
      title: 'Designed for long study hours',
      body: 'Comfortable chairs, personal lamps and a strict silence policy help you stay focused all day.',
      buttonText: '',
      buttonLink: '',
      background: 'white',
    },
  },

  gallery: {
    label: 'Photo gallery',
    description: 'A grid of photos with optional captions.',
    fields: [
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'subtitle', label: 'Text below the heading', type: 'multiline' },
      COLUMNS,
      BACKGROUND,
      {
        key: 'images', label: 'Photos', type: 'items', itemLabel: 'Photo', titleKey: 'caption', max: 24,
        itemFields: [
          { key: 'url', label: 'Photo', type: 'image' },
          { key: 'caption', label: 'Caption', type: 'text' },
        ],
        newItem: { url: '', caption: '' },
      },
    ],
    defaults: { title: 'Take a look inside', subtitle: '', columns: 3, background: 'light', images: [] },
  },

  pricing: {
    label: 'Fee',
    description: 'Shows the monthly fee from Settings with what is included.',
    fields: [
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'text', label: 'Text', type: 'multiline', help: '{MonthlyFee} shows the current fee' },
      { key: 'points', label: 'What is included (one per line)', type: 'multiline', rows: 5 },
      ...BUTTON,
      BACKGROUND,
    ],
    defaults: {
      title: 'Simple monthly fee',
      text: 'One flat fee, no hidden charges.',
      points: 'Your own fixed seat\nAir conditioning and Wi-Fi\nOpen all day\nPay online with UPI',
      buttonText: 'Book a seat',
      buttonLink: '/seats',
      background: 'tint',
    },
  },

  faq: {
    label: 'Questions & answers',
    description: 'Frequently asked questions that open on click.',
    fields: [
      { key: 'title', label: 'Heading', type: 'text' },
      BACKGROUND,
      {
        key: 'items', label: 'Questions', type: 'items', itemLabel: 'Question', titleKey: 'question', max: 30,
        itemFields: [
          { key: 'question', label: 'Question', type: 'text' },
          { key: 'answer', label: 'Answer', type: 'multiline' },
        ],
        newItem: { question: 'New question?', answer: '' },
      },
    ],
    defaults: {
      title: 'Frequently asked questions',
      background: 'white',
      items: [
        { question: 'How do I book a seat?', answer: 'Open "Available seats", choose a free seat and pay the monthly fee online.' },
        { question: 'Can I change my seat later?', answer: 'Yes, ask at the desk and we will move you to another free seat.' },
      ],
    },
  },

  cta: {
    label: 'Call to action',
    description: 'A coloured band with a message and a button.',
    fields: [
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'text', label: 'Text', type: 'multiline' },
      ...BUTTON,
      { key: 'color', label: 'Colour', type: 'select', options: [
        { value: 'primary', label: 'Blue' },
        { value: 'secondary', label: 'Green' },
        { value: 'dark', label: 'Dark' },
      ] },
    ],
    defaults: {
      title: 'Ready to start studying?',
      text: 'Seats fill up fast. Reserve yours today.',
      buttonText: 'See available seats',
      buttonLink: '/seats',
      color: 'secondary',
    },
  },
}

export const BLOCK_TYPE_KEYS = Object.keys(BLOCK_TYPES)

export function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function createBlock(type) {
  return { id: newId(), type, ...structuredClone(BLOCK_TYPES[type].defaults) }
}

// Shown until the admin publishes a design of their own
export function defaultLayout() {
  return { blocks: ['hero', 'features', 'pricing', 'cta'].map(createBlock) }
}

// Keeps only blocks the website understands and fills missing fields with defaults
export function normalizeLayout(layout) {
  const blocks = Array.isArray(layout?.blocks) ? layout.blocks : []
  return {
    blocks: blocks
      .filter((b) => b && BLOCK_TYPES[b.type])
      .map((b) => ({ ...structuredClone(BLOCK_TYPES[b.type].defaults), ...b, id: b.id || newId() })),
  }
}

// Links: "/seats" (a page of this website), "https://...", "tel:...", "mailto:..." or "#..." only.
// Returns { internal: bool, href } or null when the link is empty or not allowed.
export function safeLink(value) {
  const link = String(value ?? '').trim()
  if (!link) return null
  if (link.startsWith('/') && !link.startsWith('//')) return { internal: true, href: link }
  if (/^(https?:\/\/|tel:|mailto:|#)/i.test(link)) return { internal: false, href: link }
  return null
}

// Images: an uploaded file ("/uploads/...") or a full https:// address
export function safeImage(value) {
  const url = String(value ?? '').trim()
  if (!url) return null
  if ((url.startsWith('/') && !url.startsWith('//')) || /^https?:\/\//i.test(url)) return url
  return null
}
