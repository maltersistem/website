#!/usr/bin/env bash
#
# build-gallery.sh
# Skenira img/gallery/ folder i generiše gallery.json
#
# Korišćenje:
#   ./scripts/build-gallery.sh
#
# Slike se imenuju po konvenciji:
#   kategorija-opis-01.jpg
#   malterisanje-stambeni-objekat-01.jpg
#   fasade-poslovna-zgrada-02.webp
#   sanacije-vlaga-pukotine-03.jpg
#
# Kategorija je prva reč pre prvog "-" u imenu fajla.
# Ako ne prati konvenciju, kategorija će biti "ostalo".

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GALLERY_DIR="$PROJECT_ROOT/img/gallery"
OUTPUT="$GALLERY_DIR/gallery.json"

# Validne kategorije
VALID_CATEGORIES=("malterisanje" "fasade" "sanacije" "dekorativne" "priprema")

get_category() {
  local filename="$1"
  local base
  base="$(basename "$filename")"
  local prefix="${base%%-*}"
  prefix="${prefix,,}" # lowercase

  for cat in "${VALID_CATEGORIES[@]}"; do
    if [[ "$prefix" == "$cat" ]]; then
      echo "$cat"
      return
    fi
  done
  echo "ostalo"
}

# Pretvori ime fajla u čitljiv naslov
make_title() {
  local filename="$1"
  local base
  base="$(basename "$filename")"
  # Ukloni ekstenziju
  base="${base%.*}"
  # Ukloni trailing brojeve (npr. -01, -02)
  base="$(echo "$base" | sed 's/-[0-9]*$//')"
  # Zameni - sa razmakom i capitalize
  base="${base//-/ }"
  # Capitalize first letter
  echo "${base^}"
}

echo "Skeniram $GALLERY_DIR za slike i video..."

# Pronađi sve slike i video fajlove
images=()
while IFS= read -r -d '' file; do
  images+=("$file")
done < <(find "$GALLERY_DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.avif" -o -iname "*.mp4" -o -iname "*.webm" -o -iname "*.ogg" -o -iname "*.mov" \) -print0 | sort -z)

if [[ ${#images[@]} -eq 0 ]]; then
  echo "Nema slika/videa u $GALLERY_DIR"
  echo "Dodajte fajlove i pokrenite skript ponovo."
  echo "[]" > "$OUTPUT"
  exit 0
fi

echo "Pronađeno ${#images[@]} slika."

# Generiši JSON
echo "[" > "$OUTPUT"
for i in "${!images[@]}"; do
  file="${images[$i]}"
  rel_path="img/gallery/$(basename "$file")"
  category=$(get_category "$file")
  title=$(make_title "$file")

  comma=","
  if [[ $i -eq $((${#images[@]} - 1)) ]]; then
    comma=""
  fi

  # Check if video file
  ext="${file##*.}"
  ext="${ext,,}"
  is_video=false
  thumbnail_line=""
  case "$ext" in
    mp4|webm|ogg|mov) is_video=true ;;
  esac

  if $is_video; then
    # Look for matching thumbnail: same name but .jpg/.png
    thumb_base="${file%.*}"
    thumb=""
    for t_ext in jpg jpeg png webp; do
      if [[ -f "${thumb_base}.thumb.${t_ext}" ]]; then
        thumb="img/gallery/$(basename "${thumb_base}.thumb.${t_ext}")"
        break
      fi
    done
    thumbnail_line="\"thumbnail\": \"$thumb\","
  fi

  cat >> "$OUTPUT" <<ENTRY
  {
    "src": "$rel_path",
    ${thumbnail_line:+$thumbnail_line
    }"title": "$title",
    "description": "",
    "category": "$category"
  }${comma}
ENTRY
done
echo "]" >> "$OUTPUT"

echo "Generisan $OUTPUT sa ${#images[@]} unosa."
echo ""
echo "Možete ručno urediti gallery.json da dodate opise (description polje)."
if $is_video 2>/dev/null; then
  echo "Za video thumbnail-ove, stavite sliku sa istim imenom + .thumb.jpg"
  echo "  Primer: malterisanje-rad-01.mp4 → malterisanje-rad-01.thumb.jpg"
fi
