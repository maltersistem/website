#!/usr/bin/env bash
#
# optimize-images.sh
# Optimizuje slike za web — resize, kompresija, WebP konverzija
#
# Zavisnosti (instalirati pre korišćenja):
#   sudo apt install imagemagick webp
#
# Korišćenje:
#   ./scripts/optimize-images.sh                    # Obradi sve slike u img/
#   ./scripts/optimize-images.sh img/gallery/       # Obradi samo galeriju
#   ./scripts/optimize-images.sh --dry-run          # Prikaži šta bi uradio
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Podešavanja
GALLERY_MAX_WIDTH=1200
GALLERY_QUALITY=82
ABOUT_MAX_WIDTH=800
ABOUT_QUALITY=85
WEBP_QUALITY=80

DRY_RUN=false
TARGET_DIR="${1:-$PROJECT_ROOT/img}"

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  TARGET_DIR="${2:-$PROJECT_ROOT/img}"
fi

# Provera zavisnosti
check_deps() {
  local missing=()
  command -v convert >/dev/null 2>&1 || missing+=("imagemagick")
  command -v cwebp >/dev/null 2>&1  || missing+=("webp")

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "GREŠKA: Nedostaju alati: ${missing[*]}"
    echo "Instalirajte sa: sudo apt install ${missing[*]}"
    exit 1
  fi
}

optimize_image() {
  local file="$1"
  local max_width="$2"
  local quality="$3"
  local basename
  basename="$(basename "$file")"
  local dir
  dir="$(dirname "$file")"

  # Trenutna dimenzija
  local current_width
  current_width=$(identify -format "%w" "$file" 2>/dev/null || echo "0")

  echo "  Obradujem: $basename (${current_width}px širina)"

  if $DRY_RUN; then
    echo "    [DRY-RUN] Resize na max ${max_width}px, kvalitet ${quality}%"
    echo "    [DRY-RUN] Generisao bi WebP verziju"
    return
  fi

  # Resize ako je šire od max
  if [[ "$current_width" -gt "$max_width" ]]; then
    convert "$file" \
      -resize "${max_width}x>" \
      -quality "$quality" \
      -strip \
      -interlace Plane \
      "$file"
    echo "    Resized: ${current_width}px → ${max_width}px"
  else
    # Samo kompresuj
    convert "$file" \
      -quality "$quality" \
      -strip \
      -interlace Plane \
      "$file"
    echo "    Kompresovano (kvalitet: ${quality}%)"
  fi

  # Generiši WebP verziju
  local webp_file="${file%.*}.webp"
  if [[ ! -f "$webp_file" ]]; then
    cwebp -q "$WEBP_QUALITY" "$file" -o "$webp_file" -quiet
    echo "    WebP verzija kreirana"
  fi
}

main() {
  check_deps

  echo "==========================================="
  echo "  Optimizacija slika za Malter Sistem sajt"
  echo "==========================================="
  echo ""
  echo "Target: $TARGET_DIR"
  $DRY_RUN && echo "REŽIM: Dry run (bez promena)"
  echo ""

  local count=0

  # Galerija slike
  if [[ -d "$PROJECT_ROOT/img/gallery" ]]; then
    echo "--- Galerija (max ${GALLERY_MAX_WIDTH}px) ---"
    while IFS= read -r -d '' file; do
      optimize_image "$file" "$GALLERY_MAX_WIDTH" "$GALLERY_QUALITY"
      ((count++))
    done < <(find "$PROJECT_ROOT/img/gallery" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 | sort -z)
    echo ""
  fi

  # About slike
  if [[ -d "$PROJECT_ROOT/img/about" ]]; then
    echo "--- O nama (max ${ABOUT_MAX_WIDTH}px) ---"
    while IFS= read -r -d '' file; do
      optimize_image "$file" "$ABOUT_MAX_WIDTH" "$ABOUT_QUALITY"
      ((count++))
    done < <(find "$PROJECT_ROOT/img/about" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 | sort -z)
    echo ""
  fi

  echo "==========================================="
  echo "  Obrađeno slika: $count"
  echo "==========================================="

  if [[ $count -gt 0 ]] && ! $DRY_RUN; then
    echo ""
    echo "Sledeći korak: pokrenite ./scripts/build-gallery.sh da ažurirate gallery.json"
  fi
}

main
