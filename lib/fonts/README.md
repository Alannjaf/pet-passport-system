# Arabic/Kurdish Sorani Font Setup for jsPDF

This directory contains the font configuration for Arabic and Kurdish Sorani support in PDF generation.

## Setup Instructions

To enable Unicode font support for Arabic and Kurdish Sorani clinic names in PDFs:

1. **Download a font that supports Arabic and Kurdish Sorani:**

   - Recommended: [Noto Sans Arabic](https://fonts.google.com/noto/specimen/Noto+Sans+Arabic) (Google Fonts)
   - Alternative: Arial Unicode MS (if available)
   - Make sure the font supports both Arabic (U+0600-U+06FF) and Kurdish Sorani characters

2. **Convert the font using jsPDF Font Converter:**

   - Go to: https://raw.githack.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
   - Upload your TTF font file
   - Select "Base64 encoded" output format
   - Click "Generate" to convert

3. **Update the font file:**
   - Copy the generated base64 string from the converter
   - Open `lib/fonts/arabicFont.ts`
   - Replace the `ARABIC_FONT_BASE64` constant with the copied base64 string
   - The font will automatically be registered and used for clinic names containing Arabic/Kurdish characters

## Font Format

jsPDF requires fonts in its internal format (converted from TTF), not raw TTF files. The converter tool handles this conversion automatically.

## Usage

The font is automatically registered and used when generating clinic credential PDFs. If a clinic name contains Arabic or Kurdish Sorani characters, the Unicode font will be used automatically.
