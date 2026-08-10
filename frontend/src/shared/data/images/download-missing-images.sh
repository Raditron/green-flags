#!/usr/bin/env bash
#
# Downloads free-license photos (Wikimedia Commons) for beaches that currently have no
# picture in frontend/src/shared/data/images/. See IMAGE_SOURCES.md in this same directory
# for the full sources/attribution manifest and the "Not found" list.
#
# Match tiers (see comment on each block):
#   exact          — photo is specifically of the named beach/spot.
#   area-fallback  — no photo of that exact sub-segment exists; reused one representative
#                    photo of the parent area/locality across sibling ids (per the task's
#                    rule for indistinguishable coastline segments, e.g. "Kraymorie North 1/2/3").
#
# This script only downloads images — it does not touch index.ts or any other source file.
set -euo pipefail
cd "$(dirname "$0")"

# Wikimedia rate-limits/blocks requests that don't send a descriptive User-Agent (see
# https://meta.wikimedia.org/wiki/User-Agent_policy) — the default curl UA gets 429'd after
# a handful of requests. Identify the client and back off/retry on transient errors.
USER_AGENT="green-flags-beach-app/1.0 (https://github.com/Raditron/green-flags; image download script)"

count=0
dl() {
  local id="$1"
  local url="$2"
  echo "Downloading ${id}.jpg ..."
  curl -L -f -A "$USER_AGENT" --retry 5 --retry-delay 3 --retry-all-errors \
    -o "${id}.jpg" "$url"
  count=$((count + 1))
  sleep 1
}

# ===== Shabla =====

# durankulak — Durankulak — exact — source: https://commons.wikimedia.org/wiki/File:Durankulak_north_beach.jpg — license: CC BY-SA 4.0
dl "durankulak" "https://upload.wikimedia.org/wikipedia/commons/4/44/Durankulak_north_beach.jpg"

# krapets — Krapets — exact — source: https://commons.wikimedia.org/wiki/File:Krapets_E1.jpg — license: CC BY-SA 4.0
dl "krapets" "https://upload.wikimedia.org/wikipedia/commons/f/f1/Krapets_E1.jpg"

# shabla — Shabla — exact — source: https://commons.wikimedia.org/wiki/File:Shabla_Beach_2007.jpg — license: CC BY-SA 3.0 / GFDL
dl "shabla" "https://upload.wikimedia.org/wikipedia/commons/6/61/Shabla_Beach_2007.jpg"

# tyulenovo — Tyulenovo — exact — source: https://commons.wikimedia.org/wiki/File:Tyulenovo_cliffs_1.jpg — license: CC BY-SA 4.0
dl "tyulenovo" "https://upload.wikimedia.org/wikipedia/commons/7/77/Tyulenovo_cliffs_1.jpg"

# durankulak-north-1 — Durankulak North 1 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Durankulak_north_beach.jpg — license: CC BY-SA 4.0
dl "durankulak-north-1" "https://upload.wikimedia.org/wikipedia/commons/4/44/Durankulak_north_beach.jpg"

# durankulak-north-2 — Durankulak North 2 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Durankulak_north_beach.jpg — license: CC BY-SA 4.0
dl "durankulak-north-2" "https://upload.wikimedia.org/wikipedia/commons/4/44/Durankulak_north_beach.jpg"

# durankulak-lake — Durankulak Lake — area-fallback — source: https://commons.wikimedia.org/wiki/File:Durankulak_lake_E1.jpg — license: CC BY-SA 4.0
dl "durankulak-lake" "https://upload.wikimedia.org/wikipedia/commons/6/61/Durankulak_lake_E1.jpg"

# kosmos — Kosmos — area-fallback — source: https://commons.wikimedia.org/wiki/File:Krapets_E1.jpg — license: CC BY-SA 4.0
dl "kosmos" "https://upload.wikimedia.org/wikipedia/commons/f/f1/Krapets_E1.jpg"

# krapets-north — Krapets North (part) — area-fallback — source: https://commons.wikimedia.org/wiki/File:Krapets_E1.jpg — license: CC BY-SA 4.0
dl "krapets-north" "https://upload.wikimedia.org/wikipedia/commons/f/f1/Krapets_E1.jpg"

# krapets-central — Krapets Central — area-fallback — source: https://commons.wikimedia.org/wiki/File:Krapets_E1.jpg — license: CC BY-SA 4.0
dl "krapets-central" "https://upload.wikimedia.org/wikipedia/commons/f/f1/Krapets_E1.jpg"

# krapets-south — Krapets South — area-fallback — source: https://commons.wikimedia.org/wiki/File:Krapets_E1.jpg — license: CC BY-SA 4.0
dl "krapets-south" "https://upload.wikimedia.org/wikipedia/commons/f/f1/Krapets_E1.jpg"

# dobrudzha-north — Dobrudzha North 1 & 2 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Wild_beach_near_Shabla_(AP4P1283)_(11177943145).jpg — license: CC BY 2.0
dl "dobrudzha-north" "https://upload.wikimedia.org/wikipedia/commons/4/47/Wild_beach_near_Shabla_%28AP4P1283%29_%2811177943145%29.jpg"

# dobrudzha-south — Dobrudzha South (part) — area-fallback — source: https://commons.wikimedia.org/wiki/File:Wild_beach_near_Shabla_(AP4P1283)_(11177943145).jpg — license: CC BY 2.0
dl "dobrudzha-south" "https://upload.wikimedia.org/wikipedia/commons/4/47/Wild_beach_near_Shabla_%28AP4P1283%29_%2811177943145%29.jpg"

# ===== Kavarna =====

# kavarna — Kavarna — exact — source: https://commons.wikimedia.org/wiki/File:Kavarna_Bulgaria_aerial_photo_from_the_Black_Sea.jpg — license: CC BY-SA 2.0
dl "kavarna" "https://upload.wikimedia.org/wikipedia/commons/0/0b/Kavarna_Bulgaria_aerial_photo_from_the_Black_Sea.jpg"

# kaliakra — Kaliakra — exact — source: https://commons.wikimedia.org/wiki/File:Kaliakra_4.JPG — license: CC BY 2.5
dl "kaliakra" "https://upload.wikimedia.org/wikipedia/commons/c/cd/Kaliakra_4.JPG"

# rusalka — Rusalka — area-fallback — source: https://commons.wikimedia.org/wiki/File:Bolata_cove_in_the_Northern_Bulgarian_Black_Sea_Coast.jpg — license: CC BY-SA 2.0
dl "rusalka" "https://upload.wikimedia.org/wikipedia/commons/5/52/Bolata_cove_in_the_Northern_Bulgarian_Black_Sea_Coast.jpg"

# tauk-liman — Tauk Liman — area-fallback — source: https://commons.wikimedia.org/wiki/File:Bolata_cove_in_the_Northern_Bulgarian_Black_Sea_Coast.jpg — license: CC BY-SA 2.0
dl "tauk-liman" "https://upload.wikimedia.org/wikipedia/commons/5/52/Bolata_cove_in_the_Northern_Bulgarian_Black_Sea_Coast.jpg"

# bolata — Bolata — exact — source: https://commons.wikimedia.org/wiki/File:Bolata_cove_in_the_Northern_Bulgarian_Black_Sea_Coast.jpg — license: CC BY-SA 2.0
dl "bolata" "https://upload.wikimedia.org/wikipedia/commons/5/52/Bolata_cove_in_the_Northern_Bulgarian_Black_Sea_Coast.jpg"

# ===== Balchik =====

# balchik — Balchik — exact — source: https://commons.wikimedia.org/wiki/File:Balchik_sea_view.jpg — license: CC BY-SA 4.0
dl "balchik" "https://upload.wikimedia.org/wikipedia/commons/c/c0/Balchik_sea_view.jpg"

# tuzlata — Tuzlata — exact — source: https://commons.wikimedia.org/wiki/File:Tuzlata_Balchik_beach.jpg — license: CC BY-SA 4.0
dl "tuzlata" "https://upload.wikimedia.org/wikipedia/commons/3/31/Tuzlata_Balchik_beach.jpg"

# srebarnia-bryag — Srebarnia Bryag (Silvery Coast) — area-fallback — source: https://commons.wikimedia.org/wiki/File:Balchik_sea_view.jpg — license: CC BY-SA 4.0
dl "srebarnia-bryag" "https://upload.wikimedia.org/wikipedia/commons/c/c0/Balchik_sea_view.jpg"

# robinzon-2 — Robinson 2 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Balchik_sea_view.jpg — license: CC BY-SA 4.0
dl "robinzon-2" "https://upload.wikimedia.org/wikipedia/commons/c/c0/Balchik_sea_view.jpg"

# fish-fish-new — Fish Fish New — area-fallback — source: https://commons.wikimedia.org/wiki/File:Balchik_sea_view.jpg — license: CC BY-SA 4.0
dl "fish-fish-new" "https://upload.wikimedia.org/wikipedia/commons/c/c0/Balchik_sea_view.jpg"

# ===== Varna =====

# sveti-konstantin-i-elena — Sveti Konstantin i Elena — exact — source: https://commons.wikimedia.org/wiki/File:Constantine_and_Helena_beach_IFB.jpg — license: CC BY 2.5
dl "sveti-konstantin-i-elena" "https://upload.wikimedia.org/wikipedia/commons/0/0a/Constantine_and_Helena_beach_IFB.jpg"

# chaika-central-2 — Chaika Central 2 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Kabakum.JPG — license: CC BY-SA 3.0
dl "chaika-central-2" "https://upload.wikimedia.org/wikipedia/commons/c/c0/Kabakum.JPG"

# chaika-central-1 — Chaika Central 1 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Kabakum.JPG — license: CC BY-SA 3.0
dl "chaika-central-1" "https://upload.wikimedia.org/wikipedia/commons/c/c0/Kabakum.JPG"

# chaika-south — Chaika South — area-fallback — source: https://commons.wikimedia.org/wiki/File:Kabakum.JPG — license: CC BY-SA 3.0
dl "chaika-south" "https://upload.wikimedia.org/wikipedia/commons/c/c0/Kabakum.JPG"

# mineral-pool-south — Mineral Pool South — area-fallback — source: https://commons.wikimedia.org/wiki/File:Kabakum.JPG — license: CC BY-SA 3.0
dl "mineral-pool-south" "https://upload.wikimedia.org/wikipedia/commons/c/c0/Kabakum.JPG"

# euxinograd-1 — Euxinograd 1 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Euxinograd_%D0%BF%D0%BB%D0%B0%D0%B6.jpg — license: CC BY-SA 3.0
dl "euxinograd-1" "https://upload.wikimedia.org/wikipedia/commons/1/10/Euxinograd_%D0%BF%D0%BB%D0%B0%D0%B6.jpg"

# euxinograd-2 — Euxinograd 2 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Euxinograd_%D0%BF%D0%BB%D0%B0%D0%B6.jpg — license: CC BY-SA 3.0
dl "euxinograd-2" "https://upload.wikimedia.org/wikipedia/commons/1/10/Euxinograd_%D0%BF%D0%BB%D0%B0%D0%B6.jpg"

# euxinograd-3 — Euxinograd 3 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Euxinograd_%D0%BF%D0%BB%D0%B0%D0%B6.jpg — license: CC BY-SA 3.0
dl "euxinograd-3" "https://upload.wikimedia.org/wikipedia/commons/1/10/Euxinograd_%D0%BF%D0%BB%D0%B0%D0%B6.jpg"

# ofitserski — Ofitserski (Officers') — area-fallback — source: https://commons.wikimedia.org/wiki/File:Euxinograd_%D0%BF%D0%BB%D0%B0%D0%B6.jpg — license: CC BY-SA 3.0
dl "ofitserski" "https://upload.wikimedia.org/wikipedia/commons/1/10/Euxinograd_%D0%BF%D0%BB%D0%B0%D0%B6.jpg"

# galata-north — Galata North — area-fallback — source: https://commons.wikimedia.org/wiki/File:%D0%93%D0%B0%D0%BB%D0%B0%D1%82%D0%B0_-_panoramio.jpg — license: CC BY-SA 3.0
dl "galata-north" "https://upload.wikimedia.org/wikipedia/commons/b/b7/%D0%93%D0%B0%D0%BB%D0%B0%D1%82%D0%B0_-_panoramio.jpg"

# galata-east — Galata East — area-fallback — source: https://commons.wikimedia.org/wiki/File:%D0%93%D0%B0%D0%BB%D0%B0%D1%82%D0%B0_-_panoramio.jpg — license: CC BY-SA 3.0
dl "galata-east" "https://upload.wikimedia.org/wikipedia/commons/b/b7/%D0%93%D0%B0%D0%BB%D0%B0%D1%82%D0%B0_-_panoramio.jpg"

# fichoza-north — Fichoza North — area-fallback — source: https://commons.wikimedia.org/wiki/File:Beaches_fichosa.jpg — license: CC BY-SA 4.0
dl "fichoza-north" "https://upload.wikimedia.org/wikipedia/commons/a/a7/Beaches_fichosa.jpg"

# fichoza — Fichoza — exact — source: https://commons.wikimedia.org/wiki/File:Beaches_fichosa.jpg — license: CC BY-SA 4.0
dl "fichoza" "https://upload.wikimedia.org/wikipedia/commons/a/a7/Beaches_fichosa.jpg"

# fichoza-south — Fichoza South — area-fallback — source: https://commons.wikimedia.org/wiki/File:Beaches_fichosa.jpg — license: CC BY-SA 4.0
dl "fichoza-south" "https://upload.wikimedia.org/wikipedia/commons/a/a7/Beaches_fichosa.jpg"

# hizha-chernomorets-north — Hizha Chernomorets North — area-fallback — source: https://commons.wikimedia.org/wiki/File:Beaches_fichosa.jpg — license: CC BY-SA 4.0
dl "hizha-chernomorets-north" "https://upload.wikimedia.org/wikipedia/commons/a/a7/Beaches_fichosa.jpg"

# pasha-dere — Pasha Dere — exact — source: https://commons.wikimedia.org/wiki/File:Pasha_Dere_Yug.jpg — license: CC BY-SA 2.5 / 3.0 / GFDL
dl "pasha-dere" "https://upload.wikimedia.org/wikipedia/commons/f/fa/Pasha_Dere_Yug.jpg"

# ===== Avren =====

# romantika — Romantika — exact — source: https://commons.wikimedia.org/wiki/File:Romantika_near_Kamchia_river,_Bulgaria_1.JPG — license: CC BY-SA 3.0
dl "romantika" "https://upload.wikimedia.org/wikipedia/commons/f/f6/Romantika_near_Kamchia_river%2C_Bulgaria_1.JPG"

# kamchia-north — Kamchia North 1, 2, 4 & 5 — exact — source: https://commons.wikimedia.org/wiki/File:Mouth_of_Kamchia,_(Cliff_View).JPG — license: Public domain
dl "kamchia-north" "https://upload.wikimedia.org/wikipedia/commons/3/35/Mouth_of_Kamchia%2C_%28Cliff_View%29.JPG"

# ===== Dolni Chiflik =====

# kamchia-south — Kamchia South — area-fallback — source: https://commons.wikimedia.org/wiki/File:Dolni_chiflik,_Bulgaria_-_panoramio.jpg — license: CC BY 3.0
dl "kamchia-south" "https://upload.wikimedia.org/wikipedia/commons/2/20/Dolni_chiflik%2C_Bulgaria_-_panoramio.jpg"

# izgrev-horizont — Izgrev-Horizont — area-fallback — source: https://commons.wikimedia.org/wiki/File:Dolni_chiflik,_Bulgaria_-_panoramio.jpg — license: CC BY 3.0
dl "izgrev-horizont" "https://upload.wikimedia.org/wikipedia/commons/2/20/Dolni_chiflik%2C_Bulgaria_-_panoramio.jpg"

# shkorpilovtsi-north — Shkorpilovtsi North — exact — source: https://commons.wikimedia.org/wiki/File:Shkorpilovitsi_beach_01.jpg — license: CC BY-SA 4.0
dl "shkorpilovtsi-north" "https://upload.wikimedia.org/wikipedia/commons/2/21/Shkorpilovitsi_beach_01.jpg"

# ===== Byala =====

# byala-north — Byala North — area-fallback — source: https://commons.wikimedia.org/wiki/File:Byala_beach_01.jpg — license: CC BY-SA 4.0
dl "byala-north" "https://upload.wikimedia.org/wikipedia/commons/d/da/Byala_beach_01.jpg"

# byala-central-1 — Byala Central I — area-fallback — source: https://commons.wikimedia.org/wiki/File:Byala_beach_01.jpg — license: CC BY-SA 4.0
dl "byala-central-1" "https://upload.wikimedia.org/wikipedia/commons/d/da/Byala_beach_01.jpg"

# byala-central-3 — Byala Central III — area-fallback — source: https://commons.wikimedia.org/wiki/File:Byala_beach_01.jpg — license: CC BY-SA 4.0
dl "byala-central-3" "https://upload.wikimedia.org/wikipedia/commons/d/da/Byala_beach_01.jpg"

# byala-central-4 — Byala Central IV — area-fallback — source: https://commons.wikimedia.org/wiki/File:Byala_beach_01.jpg — license: CC BY-SA 4.0
dl "byala-central-4" "https://upload.wikimedia.org/wikipedia/commons/d/da/Byala_beach_01.jpg"

# byala-chaika — Byala Chaika — area-fallback — source: https://commons.wikimedia.org/wiki/File:Byala_beach_01.jpg — license: CC BY-SA 4.0
dl "byala-chaika" "https://upload.wikimedia.org/wikipedia/commons/d/da/Byala_beach_01.jpg"

# byala-karadere — Byala Karadere — exact — source: https://commons.wikimedia.org/wiki/File:Kara_Dere2.JPG — license: CC BY-SA 3.0 / GFDL
dl "byala-karadere" "https://upload.wikimedia.org/wikipedia/commons/3/3c/Kara_Dere2.JPG"

# ===== Nessebar =====

# elenite — Elenite — exact — source: https://commons.wikimedia.org/wiki/File:Elenite_Beach_(2831854066).jpg — license: CC BY 2.0
dl "elenite" "https://upload.wikimedia.org/wikipedia/commons/c/c5/Elenite_Beach_%282831854066%29.jpg"

# ravda — Ravda — exact — source: https://commons.wikimedia.org/wiki/File:Ravda_beach.jpg — license: Public domain
dl "ravda" "https://upload.wikimedia.org/wikipedia/commons/d/df/Ravda_beach.jpg"

# smrikite — Smrikite — area-fallback — source: https://commons.wikimedia.org/wiki/File:Elenite_Beach_(2831854066).jpg — license: CC BY 2.0
dl "smrikite" "https://upload.wikimedia.org/wikipedia/commons/c/c5/Elenite_Beach_%282831854066%29.jpg"

# elenite-east — Elenite East 1 & 2 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Elenite_Beach_(2831854066).jpg — license: CC BY 2.0
dl "elenite-east" "https://upload.wikimedia.org/wikipedia/commons/c/c5/Elenite_Beach_%282831854066%29.jpg"

# kozluka — Kozluka — area-fallback — source: https://commons.wikimedia.org/wiki/File:Ravda_beach.jpg — license: Public domain
dl "kozluka" "https://upload.wikimedia.org/wikipedia/commons/d/df/Ravda_beach.jpg"

# robinzon-west-2 — Robinson West 2 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Ravda_beach.jpg — license: Public domain
dl "robinzon-west-2" "https://upload.wikimedia.org/wikipedia/commons/d/df/Ravda_beach.jpg"

# nessebar-east — Nessebar East — area-fallback — source: https://commons.wikimedia.org/wiki/File:Ravda_beach.jpg — license: Public domain
dl "nessebar-east" "https://upload.wikimedia.org/wikipedia/commons/d/df/Ravda_beach.jpg"

# emona-south — Emona South — area-fallback — source: https://commons.wikimedia.org/wiki/File:Ravda_beach.jpg — license: Public domain
dl "emona-south" "https://upload.wikimedia.org/wikipedia/commons/d/df/Ravda_beach.jpg"

# emona-bunardzhika — Emona Bunardzhika — area-fallback — source: https://commons.wikimedia.org/wiki/File:Ravda_beach.jpg — license: Public domain
dl "emona-bunardzhika" "https://upload.wikimedia.org/wikipedia/commons/d/df/Ravda_beach.jpg"

# ===== Pomorie =====

# aheloy-north — Aheloy North — exact — source: https://commons.wikimedia.org/wiki/File:Plaj_Aheloi(2).jpg — license: CC BY-SA 3.0 / GFDL
dl "aheloy-north" "https://upload.wikimedia.org/wikipedia/commons/8/81/Plaj_Aheloi%282%29.jpg"

# camping-aheloy — Camping Aheloy (excl. part 3) — area-fallback — source: https://commons.wikimedia.org/wiki/File:Plaj_Aheloi(2).jpg — license: CC BY-SA 3.0 / GFDL
dl "camping-aheloy" "https://upload.wikimedia.org/wikipedia/commons/8/81/Plaj_Aheloi%282%29.jpg"

# pomorie-spit — Pomorie Spit — area-fallback — source: https://commons.wikimedia.org/wiki/File:Pomorie_Black_Beach_FKK.jpg — license: CC0
dl "pomorie-spit" "https://upload.wikimedia.org/wikipedia/commons/4/48/Pomorie_Black_Beach_FKK.jpg"

# pomorie-bunata — Pomorie Bunata — area-fallback — source: https://commons.wikimedia.org/wiki/File:Pomorie_Black_Beach_FKK.jpg — license: CC0
dl "pomorie-bunata" "https://upload.wikimedia.org/wikipedia/commons/4/48/Pomorie_Black_Beach_FKK.jpg"

# camping-europa — Camping Europa — area-fallback — source: https://commons.wikimedia.org/wiki/File:Pomorie_Black_Beach_FKK.jpg — license: CC0
dl "camping-europa" "https://upload.wikimedia.org/wikipedia/commons/4/48/Pomorie_Black_Beach_FKK.jpg"

# lahana-1 — Lahana 1 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Pomorie_Black_Beach_FKK.jpg — license: CC0
dl "lahana-1" "https://upload.wikimedia.org/wikipedia/commons/4/48/Pomorie_Black_Beach_FKK.jpg"

# ===== Burgas =====

# sarafovo-north — Sarafovo North — area-fallback — source: https://commons.wikimedia.org/wiki/File:Burgas_Bay,_Bulgaria.jpg — license: CC BY-SA 4.0
dl "sarafovo-north" "https://upload.wikimedia.org/wikipedia/commons/8/87/Burgas_Bay%2C_Bulgaria.jpg"

# atanasovska-kosa — Atanasovska Spit (part 2) — exact — source: https://commons.wikimedia.org/wiki/File:Lake_Atanasovsko_-_P1020250_-_seashore.JPG — license: CC BY-SA 3.0
dl "atanasovska-kosa" "https://upload.wikimedia.org/wikipedia/commons/7/72/Lake_Atanasovsko_-_P1020250_-_seashore.JPG"

# kraymorie-north-1 — Kraymorie North 1 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Chengeneskele.jpg — license: CC BY-SA 4.0
dl "kraymorie-north-1" "https://upload.wikimedia.org/wikipedia/commons/7/72/Chengeneskele.jpg"

# kraymorie-north-2 — Kraymorie North 2 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Chengeneskele.jpg — license: CC BY-SA 4.0
dl "kraymorie-north-2" "https://upload.wikimedia.org/wikipedia/commons/7/72/Chengeneskele.jpg"

# kraymorie-north-3 — Kraymorie North 3 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Chengeneskele.jpg — license: CC BY-SA 4.0
dl "kraymorie-north-3" "https://upload.wikimedia.org/wikipedia/commons/7/72/Chengeneskele.jpg"

# kraymorie-south — Kraymorie South 1 & 2 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Chengeneskele.jpg — license: CC BY-SA 4.0
dl "kraymorie-south" "https://upload.wikimedia.org/wikipedia/commons/7/72/Chengeneskele.jpg"

# otmanli — Otmanli — area-fallback — source: https://commons.wikimedia.org/wiki/File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg — license: CC BY-SA 4.0
dl "otmanli" "https://upload.wikimedia.org/wikipedia/commons/8/8d/Beach_and_Port_at_St_Anastasia_Island%2C_Black_Sea%2C_Bulgaria.jpg"

# rosenets — Rosenets — area-fallback — source: https://commons.wikimedia.org/wiki/File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg — license: CC BY-SA 4.0
dl "rosenets" "https://upload.wikimedia.org/wikipedia/commons/8/8d/Beach_and_Port_at_St_Anastasia_Island%2C_Black_Sea%2C_Bulgaria.jpg"

# rosenets-west — Rosenets West — area-fallback — source: https://commons.wikimedia.org/wiki/File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg — license: CC BY-SA 4.0
dl "rosenets-west" "https://upload.wikimedia.org/wikipedia/commons/8/8d/Beach_and_Port_at_St_Anastasia_Island%2C_Black_Sea%2C_Bulgaria.jpg"

# rosenets-central — Rosenets Central — area-fallback — source: https://commons.wikimedia.org/wiki/File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg — license: CC BY-SA 4.0
dl "rosenets-central" "https://upload.wikimedia.org/wikipedia/commons/8/8d/Beach_and_Port_at_St_Anastasia_Island%2C_Black_Sea%2C_Bulgaria.jpg"

# rosenets-east — Rosenets East — area-fallback — source: https://commons.wikimedia.org/wiki/File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg — license: CC BY-SA 4.0
dl "rosenets-east" "https://upload.wikimedia.org/wikipedia/commons/8/8d/Beach_and_Port_at_St_Anastasia_Island%2C_Black_Sea%2C_Bulgaria.jpg"

# ===== Sozopol =====

# chernomorets — Chernomorets — exact — source: https://commons.wikimedia.org/wiki/File:%D0%9C%D0%BE%D1%80%D1%81%D0%BA%D0%B8%D1%8F%D1%82_%D0%B1%D1%80%D1%8F%D0%B3_%D0%BD%D0%B0_%D0%A7%D0%B5%D1%80%D0%BD%D0%BE%D0%BC%D0%BE%D1%80%D0%B5%D1%86_%5E_Beach_of_Chernomoretz_-_panoramio.jpg — license: CC BY-SA 3.0
dl "chernomorets" "https://upload.wikimedia.org/wikipedia/commons/8/81/%D0%9C%D0%BE%D1%80%D1%81%D0%BA%D0%B8%D1%8F%D1%82_%D0%B1%D1%80%D1%8F%D0%B3_%D0%BD%D0%B0_%D0%A7%D0%B5%D1%80%D0%BD%D0%BE%D0%BC%D0%BE%D1%80%D0%B5%D1%86_%5E_Beach_of_Chernomoretz_-_panoramio.jpg"

# dyuni — Dyuni — exact — source: https://commons.wikimedia.org/wiki/File:Beach_djuni_resort.JPG — license: CC BY-SA 3.0
dl "dyuni" "https://upload.wikimedia.org/wikipedia/commons/b/ba/Beach_djuni_resort.JPG"

# vromos — Vromos — exact — source: https://commons.wikimedia.org/wiki/File:Vromos_bay.jpg — license: CC BY-SA 4.0
dl "vromos" "https://upload.wikimedia.org/wikipedia/commons/0/0e/Vromos_bay.jpg"

# alepu — Alepu — exact — source: https://commons.wikimedia.org/wiki/File:Alepu_Beach_Bulgaria_2009.JPG — license: CC BY-SA 3.0 / GFDL
dl "alepu" "https://upload.wikimedia.org/wikipedia/commons/c/c5/Alepu_Beach_Bulgaria_2009.JPG"

# ===== Primorsko =====

# arkutino — Arkutino (Water Lilies) — exact — source: https://commons.wikimedia.org/wiki/File:Arkutino_Beach.jpg — license: CC BY-SA 3.0 / GFDL
dl "arkutino" "https://upload.wikimedia.org/wikipedia/commons/7/7d/Arkutino_Beach.jpg"

# ropotamo — Ropotamo — exact — source: https://commons.wikimedia.org/wiki/File:Ropotamo_beach.jpg — license: CC BY-SA 4.0
dl "ropotamo" "https://upload.wikimedia.org/wikipedia/commons/f/f3/Ropotamo_beach.jpg"

# ===== Tsarevo =====

# lozenets — Lozenets — exact — source: https://commons.wikimedia.org/wiki/File:Pl%C3%A1%C5%BE,_Lozenec.jpg — license: CC BY-SA 4.0
dl "lozenets" "https://upload.wikimedia.org/wikipedia/commons/d/dc/Pl%C3%A1%C5%BE%2C_Lozenec.jpg"

# tsarevo — Tsarevo — exact — source: https://commons.wikimedia.org/wiki/File:Tsarevo_Plazza_-_panoramio.jpg — license: CC BY 3.0
dl "tsarevo" "https://upload.wikimedia.org/wikipedia/commons/9/91/Tsarevo_Plazza_-_panoramio.jpg"

# ahtopol — Ahtopol — exact — source: https://commons.wikimedia.org/wiki/File:Ahtopol_beach_IFB.JPG — license: CC BY 2.5
dl "ahtopol" "https://upload.wikimedia.org/wikipedia/commons/f/f8/Ahtopol_beach_IFB.JPG"

# rezovo — Rezovo — exact — source: https://commons.wikimedia.org/wiki/File:Rezovo,_BUL_-_border_with_Turkey_-_beach.JPG — license: CC BY-SA 3.0
dl "rezovo" "https://upload.wikimedia.org/wikipedia/commons/d/d2/Rezovo%2C_BUL_-_border_with_Turkey_-_beach.JPG"

# lozenets-south — Lozenets South — area-fallback — source: https://commons.wikimedia.org/wiki/File:Pl%C3%A1%C5%BE,_Lozenec.jpg — license: CC BY-SA 4.0
dl "lozenets-south" "https://upload.wikimedia.org/wikipedia/commons/d/dc/Pl%C3%A1%C5%BE%2C_Lozenec.jpg"

# malak-oazis — Malak Oazis 1-4 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Pl%C3%A1%C5%BE,_Lozenec.jpg — license: CC BY-SA 4.0
dl "malak-oazis" "https://upload.wikimedia.org/wikipedia/commons/d/dc/Pl%C3%A1%C5%BE%2C_Lozenec.jpg"

# malak-oazis-zone — Malak Oazis Zone 1, 2 & 4 Central-East — area-fallback — source: https://commons.wikimedia.org/wiki/File:Pl%C3%A1%C5%BE,_Lozenec.jpg — license: CC BY-SA 4.0
dl "malak-oazis-zone" "https://upload.wikimedia.org/wikipedia/commons/d/dc/Pl%C3%A1%C5%BE%2C_Lozenec.jpg"

# tsarevo-north — Tsarevo North 1-3 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Tsarevo_Plazza_-_panoramio.jpg — license: CC BY 3.0
dl "tsarevo-north" "https://upload.wikimedia.org/wikipedia/commons/9/91/Tsarevo_Plazza_-_panoramio.jpg"

# popski-plazh-north — Popski Plazh North 1-5 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Tsarevo_Plazza_-_panoramio.jpg — license: CC BY 3.0
dl "popski-plazh-north" "https://upload.wikimedia.org/wikipedia/commons/9/91/Tsarevo_Plazza_-_panoramio.jpg"

# tsarevo-central — Tsarevo Central — area-fallback — source: https://commons.wikimedia.org/wiki/File:Tsarevo_Plazza_-_panoramio.jpg — license: CC BY 3.0
dl "tsarevo-central" "https://upload.wikimedia.org/wikipedia/commons/9/91/Tsarevo_Plazza_-_panoramio.jpg"

# tsarevo-vasiliko — Tsarevo Vasiliko — area-fallback — source: https://commons.wikimedia.org/wiki/File:Tsarevo_Plazza_-_panoramio.jpg — license: CC BY 3.0
dl "tsarevo-vasiliko" "https://upload.wikimedia.org/wikipedia/commons/9/91/Tsarevo_Plazza_-_panoramio.jpg"

# skalite — Skalite (The Rocks) — area-fallback — source: https://commons.wikimedia.org/wiki/File:Tsarevo_Plazza_-_panoramio.jpg — license: CC BY 3.0
dl "skalite" "https://upload.wikimedia.org/wikipedia/commons/9/91/Tsarevo_Plazza_-_panoramio.jpg"

# lafina-north — Lafina North 1 — area-fallback — source: https://commons.wikimedia.org/wiki/File:Varvara_Beach_Dinev.jpg — license: CC BY 2.0
dl "lafina-north" "https://upload.wikimedia.org/wikipedia/commons/9/93/Varvara_Beach_Dinev.jpg"

# manastirich — Manastirich — area-fallback — source: https://commons.wikimedia.org/wiki/File:Varvara_Beach_Dinev.jpg — license: CC BY 2.0
dl "manastirich" "https://upload.wikimedia.org/wikipedia/commons/9/93/Varvara_Beach_Dinev.jpg"

# varvara-north — Varvara North — exact — source: https://commons.wikimedia.org/wiki/File:Varvara_Beach_Dinev.jpg — license: CC BY 2.0
dl "varvara-north" "https://upload.wikimedia.org/wikipedia/commons/9/93/Varvara_Beach_Dinev.jpg"

# ahtopol-lighthouse — Ahtopol Lighthouse — area-fallback — source: https://commons.wikimedia.org/wiki/File:Ahtopol_beach_IFB.JPG — license: CC BY 2.5
dl "ahtopol-lighthouse" "https://upload.wikimedia.org/wikipedia/commons/f/f8/Ahtopol_beach_IFB.JPG"

# ahtopol-north-west — Ahtopol North West Zone — area-fallback — source: https://commons.wikimedia.org/wiki/File:Ahtopol_beach_IFB.JPG — license: CC BY 2.5
dl "ahtopol-north-west" "https://upload.wikimedia.org/wikipedia/commons/f/f8/Ahtopol_beach_IFB.JPG"

# listi — Listi — area-fallback — source: https://commons.wikimedia.org/wiki/File:Silistar_beach_-_rocks_pano.JPG — license: CC BY-SA 3.0
dl "listi" "https://upload.wikimedia.org/wikipedia/commons/8/85/Silistar_beach_-_rocks_pano.JPG"

# silistar-north — Silistar North — area-fallback — source: https://commons.wikimedia.org/wiki/File:Silistar_beach_-_rocks_pano.JPG — license: CC BY-SA 3.0
dl "silistar-north" "https://upload.wikimedia.org/wikipedia/commons/8/85/Silistar_beach_-_rocks_pano.JPG"

# koral — Koral — exact — source: https://commons.wikimedia.org/wiki/File:Coral_-_panoramio.jpg — license: CC BY-SA 3.0
dl "koral" "https://upload.wikimedia.org/wikipedia/commons/0/06/Coral_-_panoramio.jpg"

# ayrodi-north — Ayrodi North — area-fallback — source: https://commons.wikimedia.org/wiki/File:Coral_-_panoramio.jpg — license: CC BY-SA 3.0
dl "ayrodi-north" "https://upload.wikimedia.org/wikipedia/commons/0/06/Coral_-_panoramio.jpg"

# ayrodi-south — Ayrodi South — area-fallback — source: https://commons.wikimedia.org/wiki/File:Coral_-_panoramio.jpg — license: CC BY-SA 3.0
dl "ayrodi-south" "https://upload.wikimedia.org/wikipedia/commons/0/06/Coral_-_panoramio.jpg"

# lipite — Lipite — area-fallback — source: https://commons.wikimedia.org/wiki/File:Coral_-_panoramio.jpg — license: CC BY-SA 3.0
dl "lipite" "https://upload.wikimedia.org/wikipedia/commons/0/06/Coral_-_panoramio.jpg"

# rezovo-kastrich — Rezovo Kastrich — area-fallback — source: https://commons.wikimedia.org/wiki/File:Rezovo,_BUL_-_border_with_Turkey_-_beach.JPG — license: CC BY-SA 3.0
dl "rezovo-kastrich" "https://upload.wikimedia.org/wikipedia/commons/d/d2/Rezovo%2C_BUL_-_border_with_Turkey_-_beach.JPG"

echo ""
echo "Done: downloaded ${count} image(s) into $(pwd)"
