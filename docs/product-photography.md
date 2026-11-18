# Product photographs

The user supplied 15 photos, representing four wooden objects and a complete arrangement. Two supplied feather-holder photos are byte-identical; there were 14 unique views. The complete arrangement was subsequently removed at the user’s request; the website now shows four products and 13 generated studio views.

- Untouched originals: `source-assets/product-originals/` (JPEG files copied byte-for-byte).
- Background-edited catalog versions: `public/images/products/studio/` (WebP images, up to 1280 pixels on the long side).
- Product/view mapping: `src/data/products.ts`.
- Exact image-edit prompt set, original attachment names, asset paths and original SHA-256 hashes: [product-photo-prompts.json](product-photo-prompts.json).

The built-in `image_gen` tool was used for background replacement. The shared direction was a seamless warm ivory/limestone studio surface, soft contact shadows, and preservation of the original objects, composition, wood grain, colours, inlays and photographed props. The original files were retained because generated edits are presentation versions, not a pixel-identical substitute for source photographs. The website displays generated studio images only. The original-photo controls were removed. Untouched source photographs are archived outside `public/` and are not served by the website. The excluded arrangement edit is archived at `source-assets/product-edits/15.webp`.

Product titles are descriptive catalog names. Prices, wood species, dimensions, stock status and included accessories have not been invented; visitors can ask about these on WhatsApp.
