# Image sources & attribution

Manifest for the photos downloaded by `download-missing-images.sh` into this directory. All
photos are from Wikimedia Commons and are free to redistribute (public domain / CC0 / CC BY /
CC BY-SA). This file does not change anything about how the app consumes images — see
`index.ts` for the `BEACH_IMAGES` map (not modified by this manifest).

**Match tier** — `exact` means the photo is specifically of the named beach/spot. `area-fallback`
means no photo of that exact sub-segment could be found, so one representative photo of the
parent area/locality was reused across sibling ids (e.g. the three "Kraymorie North" segments
all share one Chengene Skele photo) — per the task's guidance that indistinguishable coastline
segments don't need three separately-sourced photos.

**Attribution text** is only required for CC BY / CC BY-SA licensed works; public domain / CC0
works need no attribution but it's included anyway for courtesy/traceability.

## Shabla area

| id | beach name | tier | source page | license | attribution |
|---|---|---|---|---|---|
| durankulak | Durankulak | exact | [File:Durankulak_north_beach.jpg](https://commons.wikimedia.org/wiki/File:Durankulak_north_beach.jpg) | CC BY-SA 4.0 | "Durankulak north beach" by Alwcur, via Wikimedia Commons, CC BY-SA 4.0 |
| krapets | Krapets | exact | [File:Krapets_E1.jpg](https://commons.wikimedia.org/wiki/File:Krapets_E1.jpg) | CC BY-SA 4.0 | "Krapets E1" by Eola, via Wikimedia Commons, CC BY-SA 4.0 |
| shabla | Shabla | exact | [File:Shabla_Beach_2007.jpg](https://commons.wikimedia.org/wiki/File:Shabla_Beach_2007.jpg) | CC BY-SA 3.0 / GFDL | "Shabla Beach 2007" by Hoowster, via Wikimedia Commons, CC BY-SA 3.0 |
| tyulenovo | Tyulenovo | exact | [File:Tyulenovo_cliffs_1.jpg](https://commons.wikimedia.org/wiki/File:Tyulenovo_cliffs_1.jpg) | CC BY-SA 4.0 | "Tyulenovo cliffs 1" by Spiritia, via Wikimedia Commons, CC BY-SA 4.0 |
| durankulak-north-1 | Durankulak North 1 | area-fallback | [File:Durankulak_north_beach.jpg](https://commons.wikimedia.org/wiki/File:Durankulak_north_beach.jpg) | CC BY-SA 4.0 | "Durankulak north beach" by Alwcur, via Wikimedia Commons, CC BY-SA 4.0 |
| durankulak-north-2 | Durankulak North 2 | area-fallback | [File:Durankulak_north_beach.jpg](https://commons.wikimedia.org/wiki/File:Durankulak_north_beach.jpg) | CC BY-SA 4.0 | "Durankulak north beach" by Alwcur, via Wikimedia Commons, CC BY-SA 4.0 |
| durankulak-lake | Durankulak Lake | area-fallback | [File:Durankulak_lake_E1.jpg](https://commons.wikimedia.org/wiki/File:Durankulak_lake_E1.jpg) | CC BY-SA 4.0 | "Durankulak lake E1" by Eola, via Wikimedia Commons, CC BY-SA 4.0 |
| kosmos | Kosmos | area-fallback | [File:Krapets_E1.jpg](https://commons.wikimedia.org/wiki/File:Krapets_E1.jpg) | CC BY-SA 4.0 | "Krapets E1" by Eola, via Wikimedia Commons, CC BY-SA 4.0 |
| krapets-north | Krapets North (part) | area-fallback | [File:Krapets_E1.jpg](https://commons.wikimedia.org/wiki/File:Krapets_E1.jpg) | CC BY-SA 4.0 | "Krapets E1" by Eola, via Wikimedia Commons, CC BY-SA 4.0 |
| krapets-central | Krapets Central | area-fallback | [File:Krapets_E1.jpg](https://commons.wikimedia.org/wiki/File:Krapets_E1.jpg) | CC BY-SA 4.0 | "Krapets E1" by Eola, via Wikimedia Commons, CC BY-SA 4.0 |
| krapets-south | Krapets South | area-fallback | [File:Krapets_E1.jpg](https://commons.wikimedia.org/wiki/File:Krapets_E1.jpg) | CC BY-SA 4.0 | "Krapets E1" by Eola, via Wikimedia Commons, CC BY-SA 4.0 |
| dobrudzha-north | Dobrudzha North 1 & 2 | area-fallback | [File:Wild_beach_near_Shabla_(AP4P1283)_(11177943145).jpg](https://commons.wikimedia.org/wiki/File:Wild_beach_near_Shabla_(AP4P1283)_(11177943145).jpg) | CC BY 2.0 | "Wild beach near Shabla" by Alexandru Panoiu, via Wikimedia Commons, CC BY 2.0 |
| dobrudzha-south | Dobrudzha South (part) | area-fallback | [File:Wild_beach_near_Shabla_(AP4P1283)_(11177943145).jpg](https://commons.wikimedia.org/wiki/File:Wild_beach_near_Shabla_(AP4P1283)_(11177943145).jpg) | CC BY 2.0 | "Wild beach near Shabla" by Alexandru Panoiu, via Wikimedia Commons, CC BY 2.0 |

## Kavarna area

| id | beach name | tier | source page | license | attribution |
|---|---|---|---|---|---|
| kavarna | Kavarna | exact | [File:Kavarna_Bulgaria_aerial_photo_from_the_Black_Sea.jpg](https://commons.wikimedia.org/wiki/File:Kavarna_Bulgaria_aerial_photo_from_the_Black_Sea.jpg) | CC BY-SA 2.0 | "Kavarna Bulgaria aerial photo from the Black Sea" by Boby Dimitrov, via Wikimedia Commons, CC BY-SA 2.0 |
| kaliakra | Kaliakra | exact | [File:Kaliakra_4.JPG](https://commons.wikimedia.org/wiki/File:Kaliakra_4.JPG) | CC BY 2.5 | "Kaliakra 4" by Milen Laskov, via Wikimedia Commons, CC BY 2.5 |
| rusalka | Rusalka | area-fallback | [File:Bolata_cove_in_the_Northern_Bulgarian_Black_Sea_Coast.jpg](https://commons.wikimedia.org/wiki/File:Bolata_cove_in_the_Northern_Bulgarian_Black_Sea_Coast.jpg) | CC BY-SA 2.0 | "Bolata cove in the Northern Bulgarian Black Sea Coast" by Dimitar Bachvarov, via Wikimedia Commons, CC BY-SA 2.0 |
| tauk-liman | Tauk Liman | area-fallback | [File:Bolata_cove_in_the_Northern_Bulgarian_Black_Sea_Coast.jpg](https://commons.wikimedia.org/wiki/File:Bolata_cove_in_the_Northern_Bulgarian_Black_Sea_Coast.jpg) | CC BY-SA 2.0 | "Bolata cove in the Northern Bulgarian Black Sea Coast" by Dimitar Bachvarov, via Wikimedia Commons, CC BY-SA 2.0 |
| bolata | Bolata | exact | [File:Bolata_cove_in_the_Northern_Bulgarian_Black_Sea_Coast.jpg](https://commons.wikimedia.org/wiki/File:Bolata_cove_in_the_Northern_Bulgarian_Black_Sea_Coast.jpg) | CC BY-SA 2.0 | "Bolata cove in the Northern Bulgarian Black Sea Coast" by Dimitar Bachvarov, via Wikimedia Commons, CC BY-SA 2.0 |

## Balchik area

| id | beach name | tier | source page | license | attribution |
|---|---|---|---|---|---|
| balchik | Balchik | exact | [File:Balchik_sea_view.jpg](https://commons.wikimedia.org/wiki/File:Balchik_sea_view.jpg) | CC BY-SA 4.0 | "Balchik sea view" by LokkLamora, via Wikimedia Commons, CC BY-SA 4.0 |
| tuzlata | Tuzlata | exact | [File:Tuzlata_Balchik_beach.jpg](https://commons.wikimedia.org/wiki/File:Tuzlata_Balchik_beach.jpg) | CC BY-SA 4.0 | "Tuzlata Balchik beach" by Spiritia, via Wikimedia Commons, CC BY-SA 4.0 |
| srebarnia-bryag | Srebarnia Bryag (Silvery Coast) | area-fallback | [File:Balchik_sea_view.jpg](https://commons.wikimedia.org/wiki/File:Balchik_sea_view.jpg) | CC BY-SA 4.0 | "Balchik sea view" by LokkLamora, via Wikimedia Commons, CC BY-SA 4.0 |
| robinzon-2 | Robinson 2 | area-fallback | [File:Balchik_sea_view.jpg](https://commons.wikimedia.org/wiki/File:Balchik_sea_view.jpg) | CC BY-SA 4.0 | "Balchik sea view" by LokkLamora, via Wikimedia Commons, CC BY-SA 4.0 |
| fish-fish-new | Fish Fish New | area-fallback | [File:Balchik_sea_view.jpg](https://commons.wikimedia.org/wiki/File:Balchik_sea_view.jpg) | CC BY-SA 4.0 | "Balchik sea view" by LokkLamora, via Wikimedia Commons, CC BY-SA 4.0 |

## Varna area

| id | beach name | tier | source page | license | attribution |
|---|---|---|---|---|---|
| sveti-konstantin-i-elena | Sveti Konstantin i Elena | exact | [File:Constantine_and_Helena_beach_IFB.jpg](https://commons.wikimedia.org/wiki/File:Constantine_and_Helena_beach_IFB.jpg) | CC BY 2.5 | "Constantine and Helena beach IFB" by Kiril Kapustin, via Wikimedia Commons, CC BY 2.5 |
| chaika-central-2 | Chaika Central 2 | area-fallback | [File:Kabakum.JPG](https://commons.wikimedia.org/wiki/File:Kabakum.JPG) | CC BY-SA 3.0 | "Kabakum" by Svilen Enev, via Wikimedia Commons, CC BY-SA 3.0 |
| chaika-central-1 | Chaika Central 1 | area-fallback | [File:Kabakum.JPG](https://commons.wikimedia.org/wiki/File:Kabakum.JPG) | CC BY-SA 3.0 | "Kabakum" by Svilen Enev, via Wikimedia Commons, CC BY-SA 3.0 |
| chaika-south | Chaika South | area-fallback | [File:Kabakum.JPG](https://commons.wikimedia.org/wiki/File:Kabakum.JPG) | CC BY-SA 3.0 | "Kabakum" by Svilen Enev, via Wikimedia Commons, CC BY-SA 3.0 |
| mineral-pool-south | Mineral Pool South | area-fallback | [File:Kabakum.JPG](https://commons.wikimedia.org/wiki/File:Kabakum.JPG) | CC BY-SA 3.0 | "Kabakum" by Svilen Enev, via Wikimedia Commons, CC BY-SA 3.0 |
| euxinograd-1 | Euxinograd 1 | area-fallback | [File:Euxinograd_плаж.jpg](https://commons.wikimedia.org/wiki/File:Euxinograd_%D0%BF%D0%BB%D0%B0%D0%B6.jpg) | CC BY-SA 3.0 | "Euxinograd плаж" by Stanqo, via Wikimedia Commons, CC BY-SA 3.0 |
| euxinograd-2 | Euxinograd 2 | area-fallback | [File:Euxinograd_плаж.jpg](https://commons.wikimedia.org/wiki/File:Euxinograd_%D0%BF%D0%BB%D0%B0%D0%B6.jpg) | CC BY-SA 3.0 | "Euxinograd плаж" by Stanqo, via Wikimedia Commons, CC BY-SA 3.0 |
| euxinograd-3 | Euxinograd 3 | area-fallback | [File:Euxinograd_плаж.jpg](https://commons.wikimedia.org/wiki/File:Euxinograd_%D0%BF%D0%BB%D0%B0%D0%B6.jpg) | CC BY-SA 3.0 | "Euxinograd плаж" by Stanqo, via Wikimedia Commons, CC BY-SA 3.0 |
| ofitserski | Ofitserski (Officers') | area-fallback | [File:Euxinograd_плаж.jpg](https://commons.wikimedia.org/wiki/File:Euxinograd_%D0%BF%D0%BB%D0%B0%D0%B6.jpg) | CC BY-SA 3.0 | "Euxinograd плаж" by Stanqo, via Wikimedia Commons, CC BY-SA 3.0 |
| galata-north | Galata North | area-fallback | [File:Галата_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:%D0%93%D0%B0%D0%BB%D0%B0%D1%82%D0%B0_-_panoramio.jpg) | CC BY-SA 3.0 | "Галата - panoramio" by Shtilian Shterev, via Wikimedia Commons, CC BY-SA 3.0 |
| galata-east | Galata East | area-fallback | [File:Галата_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:%D0%93%D0%B0%D0%BB%D0%B0%D1%82%D0%B0_-_panoramio.jpg) | CC BY-SA 3.0 | "Галата - panoramio" by Shtilian Shterev, via Wikimedia Commons, CC BY-SA 3.0 |
| fichoza-north | Fichoza North | area-fallback | [File:Beaches_fichosa.jpg](https://commons.wikimedia.org/wiki/File:Beaches_fichosa.jpg) | CC BY-SA 4.0 | "Beaches fichosa" by VisitVarna, via Wikimedia Commons, CC BY-SA 4.0 |
| fichoza | Fichoza | exact | [File:Beaches_fichosa.jpg](https://commons.wikimedia.org/wiki/File:Beaches_fichosa.jpg) | CC BY-SA 4.0 | "Beaches fichosa" by VisitVarna, via Wikimedia Commons, CC BY-SA 4.0 |
| fichoza-south | Fichoza South | area-fallback | [File:Beaches_fichosa.jpg](https://commons.wikimedia.org/wiki/File:Beaches_fichosa.jpg) | CC BY-SA 4.0 | "Beaches fichosa" by VisitVarna, via Wikimedia Commons, CC BY-SA 4.0 |
| hizha-chernomorets-north | Hizha Chernomorets North | area-fallback | [File:Beaches_fichosa.jpg](https://commons.wikimedia.org/wiki/File:Beaches_fichosa.jpg) | CC BY-SA 4.0 | "Beaches fichosa" by VisitVarna, via Wikimedia Commons, CC BY-SA 4.0 |
| pasha-dere | Pasha Dere | exact | [File:Pasha_Dere_Yug.jpg](https://commons.wikimedia.org/wiki/File:Pasha_Dere_Yug.jpg) | CC BY-SA 2.5 / 3.0 / GFDL | "Pasha Dere Yug" by Svilen Enev, via Wikimedia Commons, CC BY-SA 3.0 |

## Avren area

| id | beach name | tier | source page | license | attribution |
|---|---|---|---|---|---|
| romantika | Romantika | exact | [File:Romantika_near_Kamchia_river,_Bulgaria_1.JPG](https://commons.wikimedia.org/wiki/File:Romantika_near_Kamchia_river,_Bulgaria_1.JPG) | CC BY-SA 3.0 | "Romantika near Kamchia river, Bulgaria 1" by Svilen Enev, via Wikimedia Commons, CC BY-SA 3.0 |
| kamchia-north | Kamchia North 1, 2, 4 & 5 | exact | [File:Mouth_of_Kamchia,_(Cliff_View).JPG](https://commons.wikimedia.org/wiki/File:Mouth_of_Kamchia,_(Cliff_View).JPG) | Public domain | "Mouth of Kamchia (Cliff View)" by P.Marlow, via Wikimedia Commons, public domain (no attribution required) |

## Dolni Chiflik area

| id | beach name | tier | source page | license | attribution |
|---|---|---|---|---|---|
| kamchia-south | Kamchia South | area-fallback | [File:Dolni_chiflik,_Bulgaria_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:Dolni_chiflik,_Bulgaria_-_panoramio.jpg) | CC BY 3.0 | "Dolni chiflik, Bulgaria - panoramio" by Plamena Vlaeva, via Wikimedia Commons, CC BY 3.0 |
| izgrev-horizont | Izgrev-Horizont | area-fallback | [File:Dolni_chiflik,_Bulgaria_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:Dolni_chiflik,_Bulgaria_-_panoramio.jpg) | CC BY 3.0 | "Dolni chiflik, Bulgaria - panoramio" by Plamena Vlaeva, via Wikimedia Commons, CC BY 3.0 |
| shkorpilovtsi-north | Shkorpilovtsi North | exact | [File:Shkorpilovitsi_beach_01.jpg](https://commons.wikimedia.org/wiki/File:Shkorpilovitsi_beach_01.jpg) | CC BY-SA 4.0 | "Shkorpilovitsi beach 01" by Kritzolina, via Wikimedia Commons, CC BY-SA 4.0 |

## Byala area

| id | beach name | tier | source page | license | attribution |
|---|---|---|---|---|---|
| byala-north | Byala North | area-fallback | [File:Byala_beach_01.jpg](https://commons.wikimedia.org/wiki/File:Byala_beach_01.jpg) | CC BY-SA 4.0 | "Byala beach 01" by Kritzolina, via Wikimedia Commons, CC BY-SA 4.0 |
| byala-central-1 | Byala Central I | area-fallback | [File:Byala_beach_01.jpg](https://commons.wikimedia.org/wiki/File:Byala_beach_01.jpg) | CC BY-SA 4.0 | "Byala beach 01" by Kritzolina, via Wikimedia Commons, CC BY-SA 4.0 |
| byala-central-3 | Byala Central III | area-fallback | [File:Byala_beach_01.jpg](https://commons.wikimedia.org/wiki/File:Byala_beach_01.jpg) | CC BY-SA 4.0 | "Byala beach 01" by Kritzolina, via Wikimedia Commons, CC BY-SA 4.0 |
| byala-central-4 | Byala Central IV | area-fallback | [File:Byala_beach_01.jpg](https://commons.wikimedia.org/wiki/File:Byala_beach_01.jpg) | CC BY-SA 4.0 | "Byala beach 01" by Kritzolina, via Wikimedia Commons, CC BY-SA 4.0 |
| byala-chaika | Byala Chaika | area-fallback | [File:Byala_beach_01.jpg](https://commons.wikimedia.org/wiki/File:Byala_beach_01.jpg) | CC BY-SA 4.0 | "Byala beach 01" by Kritzolina, via Wikimedia Commons, CC BY-SA 4.0 |
| byala-karadere | Byala Karadere | exact | [File:Kara_Dere2.JPG](https://commons.wikimedia.org/wiki/File:Kara_Dere2.JPG) | CC BY-SA 3.0 / GFDL | "Kara Dere2" by Svik (Svilen Enev), via Wikimedia Commons, CC BY-SA 3.0 |

## Nessebar area

| id | beach name | tier | source page | license | attribution |
|---|---|---|---|---|---|
| elenite | Elenite | exact | [File:Elenite_Beach_(2831854066).jpg](https://commons.wikimedia.org/wiki/File:Elenite_Beach_(2831854066).jpg) | CC BY 2.0 | "Elenite Beach" by Vladislav Bezrukov, via Wikimedia Commons, CC BY 2.0 |
| ravda | Ravda | exact | [File:Ravda_beach.jpg](https://commons.wikimedia.org/wiki/File:Ravda_beach.jpg) | Public domain | "Ravda beach" by Izvora, via Wikimedia Commons, public domain (no attribution required) |
| smrikite | Smrikite | area-fallback | [File:Elenite_Beach_(2831854066).jpg](https://commons.wikimedia.org/wiki/File:Elenite_Beach_(2831854066).jpg) | CC BY 2.0 | "Elenite Beach" by Vladislav Bezrukov, via Wikimedia Commons, CC BY 2.0 |
| elenite-east | Elenite East 1 & 2 | area-fallback | [File:Elenite_Beach_(2831854066).jpg](https://commons.wikimedia.org/wiki/File:Elenite_Beach_(2831854066).jpg) | CC BY 2.0 | "Elenite Beach" by Vladislav Bezrukov, via Wikimedia Commons, CC BY 2.0 |
| kozluka | Kozluka | area-fallback | [File:Ravda_beach.jpg](https://commons.wikimedia.org/wiki/File:Ravda_beach.jpg) | Public domain | "Ravda beach" by Izvora, via Wikimedia Commons, public domain |
| robinzon-west-2 | Robinson West 2 | area-fallback | [File:Ravda_beach.jpg](https://commons.wikimedia.org/wiki/File:Ravda_beach.jpg) | Public domain | "Ravda beach" by Izvora, via Wikimedia Commons, public domain |
| nessebar-east | Nessebar East | area-fallback | [File:Ravda_beach.jpg](https://commons.wikimedia.org/wiki/File:Ravda_beach.jpg) | Public domain | "Ravda beach" by Izvora, via Wikimedia Commons, public domain |
| emona-south | Emona South | area-fallback | [File:Ravda_beach.jpg](https://commons.wikimedia.org/wiki/File:Ravda_beach.jpg) | Public domain | "Ravda beach" by Izvora, via Wikimedia Commons, public domain |
| emona-bunardzhika | Emona Bunardzhika | area-fallback | [File:Ravda_beach.jpg](https://commons.wikimedia.org/wiki/File:Ravda_beach.jpg) | Public domain | "Ravda beach" by Izvora, via Wikimedia Commons, public domain |

## Pomorie area

| id | beach name | tier | source page | license | attribution |
|---|---|---|---|---|---|
| aheloy-north | Aheloy North | exact | [File:Plaj_Aheloi(2).jpg](https://commons.wikimedia.org/wiki/File:Plaj_Aheloi(2).jpg) | CC BY-SA 3.0 / GFDL | "Plaj Aheloi(2)" by Yani Iliev, via Wikimedia Commons, CC BY-SA 3.0 |
| camping-aheloy | Camping Aheloy (excl. part 3) | area-fallback | [File:Plaj_Aheloi(2).jpg](https://commons.wikimedia.org/wiki/File:Plaj_Aheloi(2).jpg) | CC BY-SA 3.0 / GFDL | "Plaj Aheloi(2)" by Yani Iliev, via Wikimedia Commons, CC BY-SA 3.0 |
| pomorie-spit | Pomorie Spit | area-fallback | [File:Pomorie_Black_Beach_FKK.jpg](https://commons.wikimedia.org/wiki/File:Pomorie_Black_Beach_FKK.jpg) | CC0 | "Pomorie Black Beach FKK" by Mojmir Churavy, via Wikimedia Commons, CC0 (no attribution required) |
| pomorie-bunata | Pomorie Bunata | area-fallback | [File:Pomorie_Black_Beach_FKK.jpg](https://commons.wikimedia.org/wiki/File:Pomorie_Black_Beach_FKK.jpg) | CC0 | "Pomorie Black Beach FKK" by Mojmir Churavy, via Wikimedia Commons, CC0 |
| camping-europa | Camping Europa | area-fallback | [File:Pomorie_Black_Beach_FKK.jpg](https://commons.wikimedia.org/wiki/File:Pomorie_Black_Beach_FKK.jpg) | CC0 | "Pomorie Black Beach FKK" by Mojmir Churavy, via Wikimedia Commons, CC0 |
| lahana-1 | Lahana 1 | area-fallback | [File:Pomorie_Black_Beach_FKK.jpg](https://commons.wikimedia.org/wiki/File:Pomorie_Black_Beach_FKK.jpg) | CC0 | "Pomorie Black Beach FKK" by Mojmir Churavy, via Wikimedia Commons, CC0 |

## Burgas area

| id | beach name | tier | source page | license | attribution |
|---|---|---|---|---|---|
| sarafovo-north | Sarafovo North | area-fallback | [File:Burgas_Bay,_Bulgaria.jpg](https://commons.wikimedia.org/wiki/File:Burgas_Bay,_Bulgaria.jpg) | CC BY-SA 4.0 | "Burgas Bay, Bulgaria" by Ssu, via Wikimedia Commons, CC BY-SA 4.0 |
| atanasovska-kosa | Atanasovska Spit (part 2) | exact | [File:Lake_Atanasovsko_-_P1020250_-_seashore.JPG](https://commons.wikimedia.org/wiki/File:Lake_Atanasovsko_-_P1020250_-_seashore.JPG) | CC BY-SA 3.0 | "Lake Atanasovsko - P1020250 - seashore" by Vmenkov, via Wikimedia Commons, CC BY-SA 3.0 |
| kraymorie-north-1 | Kraymorie North 1 | area-fallback | [File:Chengeneskele.jpg](https://commons.wikimedia.org/wiki/File:Chengeneskele.jpg) | CC BY-SA 4.0 | "Chengeneskele" by Evgord (Evgeni Dinev), via Wikimedia Commons, CC BY-SA 4.0 |
| kraymorie-north-2 | Kraymorie North 2 | area-fallback | [File:Chengeneskele.jpg](https://commons.wikimedia.org/wiki/File:Chengeneskele.jpg) | CC BY-SA 4.0 | "Chengeneskele" by Evgord (Evgeni Dinev), via Wikimedia Commons, CC BY-SA 4.0 |
| kraymorie-north-3 | Kraymorie North 3 | area-fallback | [File:Chengeneskele.jpg](https://commons.wikimedia.org/wiki/File:Chengeneskele.jpg) | CC BY-SA 4.0 | "Chengeneskele" by Evgord (Evgeni Dinev), via Wikimedia Commons, CC BY-SA 4.0 |
| kraymorie-south | Kraymorie South 1 & 2 | area-fallback | [File:Chengeneskele.jpg](https://commons.wikimedia.org/wiki/File:Chengeneskele.jpg) | CC BY-SA 4.0 | "Chengeneskele" by Evgord (Evgeni Dinev), via Wikimedia Commons, CC BY-SA 4.0 |
| otmanli | Otmanli | area-fallback | [File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg](https://commons.wikimedia.org/wiki/File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg) | CC BY-SA 4.0 | "Beach and Port at St Anastasia Island, Black Sea, Bulgaria" by 5ko, via Wikimedia Commons, CC BY-SA 4.0 |
| rosenets | Rosenets | area-fallback | [File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg](https://commons.wikimedia.org/wiki/File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg) | CC BY-SA 4.0 | "Beach and Port at St Anastasia Island, Black Sea, Bulgaria" by 5ko, via Wikimedia Commons, CC BY-SA 4.0 |
| rosenets-west | Rosenets West | area-fallback | [File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg](https://commons.wikimedia.org/wiki/File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg) | CC BY-SA 4.0 | "Beach and Port at St Anastasia Island, Black Sea, Bulgaria" by 5ko, via Wikimedia Commons, CC BY-SA 4.0 |
| rosenets-central | Rosenets Central | area-fallback | [File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg](https://commons.wikimedia.org/wiki/File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg) | CC BY-SA 4.0 | "Beach and Port at St Anastasia Island, Black Sea, Bulgaria" by 5ko, via Wikimedia Commons, CC BY-SA 4.0 |
| rosenets-east | Rosenets East | area-fallback | [File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg](https://commons.wikimedia.org/wiki/File:Beach_and_Port_at_St_Anastasia_Island,_Black_Sea,_Bulgaria.jpg) | CC BY-SA 4.0 | "Beach and Port at St Anastasia Island, Black Sea, Bulgaria" by 5ko, via Wikimedia Commons, CC BY-SA 4.0 |

## Sozopol area

| id | beach name | tier | source page | license | attribution |
|---|---|---|---|---|---|
| chernomorets | Chernomorets | exact | [File:Морският_бряг_на_Черноморец_^_Beach_of_Chernomoretz_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:%D0%9C%D0%BE%D1%80%D1%81%D0%BA%D0%B8%D1%8F%D1%82_%D0%B1%D1%80%D1%8F%D0%B3_%D0%BD%D0%B0_%D0%A7%D0%B5%D1%80%D0%BD%D0%BE%D0%BC%D0%BE%D1%80%D0%B5%D1%86_%5E_Beach_of_Chernomoretz_-_panoramio.jpg) | CC BY-SA 3.0 | "Beach of Chernomoretz" by Ivan Samardzhiev, via Wikimedia Commons, CC BY-SA 3.0 |
| dyuni | Dyuni | exact | [File:Beach_djuni_resort.JPG](https://commons.wikimedia.org/wiki/File:Beach_djuni_resort.JPG) | CC BY-SA 3.0 | "Beach djuni resort" by Wayne2435, via Wikimedia Commons, CC BY-SA 3.0 |
| vromos | Vromos | exact | [File:Vromos_bay.jpg](https://commons.wikimedia.org/wiki/File:Vromos_bay.jpg) | CC BY-SA 4.0 | "Vromos bay" by Terzo1313, via Wikimedia Commons, CC BY-SA 4.0 |
| alepu | Alepu | exact | [File:Alepu_Beach_Bulgaria_2009.JPG](https://commons.wikimedia.org/wiki/File:Alepu_Beach_Bulgaria_2009.JPG) | CC BY-SA 3.0 / GFDL | "Alepu Beach Bulgaria 2009" by Footballer99, via Wikimedia Commons, CC BY-SA 3.0 |

## Primorsko area

| id | beach name | tier | source page | license | attribution |
|---|---|---|---|---|---|
| arkutino | Arkutino (Water Lilies) | exact | [File:Arkutino_Beach.jpg](https://commons.wikimedia.org/wiki/File:Arkutino_Beach.jpg) | CC BY-SA 3.0 / GFDL | "Arkutino Beach" by Lyubomir Ivanov, via Wikimedia Commons, CC BY-SA 3.0 |
| ropotamo | Ropotamo | exact | [File:Ropotamo_beach.jpg](https://commons.wikimedia.org/wiki/File:Ropotamo_beach.jpg) | CC BY-SA 4.0 | "Ropotamo beach" by Sinkuchi, via Wikimedia Commons, CC BY-SA 4.0 |

## Tsarevo area

| id | beach name | tier | source page | license | attribution |
|---|---|---|---|---|---|
| lozenets | Lozenets | exact | [File:Pláž,_Lozenec.jpg](https://commons.wikimedia.org/wiki/File:Pl%C3%A1%C5%BE,_Lozenec.jpg) | CC BY-SA 4.0 | "Pláž, Lozenec" by Ondřej Žváček, via Wikimedia Commons, CC BY-SA 4.0 |
| tsarevo | Tsarevo | exact | [File:Tsarevo_Plazza_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:Tsarevo_Plazza_-_panoramio.jpg) | CC BY 3.0 | "Tsarevo Plazza - panoramio" by SpaceControl, via Wikimedia Commons, CC BY 3.0 |
| ahtopol | Ahtopol | exact | [File:Ahtopol_beach_IFB.JPG](https://commons.wikimedia.org/wiki/File:Ahtopol_beach_IFB.JPG) | CC BY 2.5 | "Ahtopol beach IFB" by Nenko Lazarov, via Wikimedia Commons, CC BY 2.5 |
| rezovo | Rezovo | exact | [File:Rezovo,_BUL_-_border_with_Turkey_-_beach.JPG](https://commons.wikimedia.org/wiki/File:Rezovo,_BUL_-_border_with_Turkey_-_beach.JPG) | CC BY-SA 3.0 | "Rezovo, BUL - border with Turkey - beach" by Pudelek (Marcin Szala), via Wikimedia Commons, CC BY-SA 3.0 |
| lozenets-south | Lozenets South | area-fallback | [File:Pláž,_Lozenec.jpg](https://commons.wikimedia.org/wiki/File:Pl%C3%A1%C5%BE,_Lozenec.jpg) | CC BY-SA 4.0 | "Pláž, Lozenec" by Ondřej Žváček, via Wikimedia Commons, CC BY-SA 4.0 |
| malak-oazis | Malak Oazis 1-4 | area-fallback | [File:Pláž,_Lozenec.jpg](https://commons.wikimedia.org/wiki/File:Pl%C3%A1%C5%BE,_Lozenec.jpg) | CC BY-SA 4.0 | "Pláž, Lozenec" by Ondřej Žváček, via Wikimedia Commons, CC BY-SA 4.0 |
| malak-oazis-zone | Malak Oazis Zone 1, 2 & 4 Central-East | area-fallback | [File:Pláž,_Lozenec.jpg](https://commons.wikimedia.org/wiki/File:Pl%C3%A1%C5%BE,_Lozenec.jpg) | CC BY-SA 4.0 | "Pláž, Lozenec" by Ondřej Žváček, via Wikimedia Commons, CC BY-SA 4.0 |
| tsarevo-north | Tsarevo North 1-3 | area-fallback | [File:Tsarevo_Plazza_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:Tsarevo_Plazza_-_panoramio.jpg) | CC BY 3.0 | "Tsarevo Plazza - panoramio" by SpaceControl, via Wikimedia Commons, CC BY 3.0 |
| popski-plazh-north | Popski Plazh North 1-5 | area-fallback | [File:Tsarevo_Plazza_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:Tsarevo_Plazza_-_panoramio.jpg) | CC BY 3.0 | "Tsarevo Plazza - panoramio" by SpaceControl, via Wikimedia Commons, CC BY 3.0 |
| tsarevo-central | Tsarevo Central | area-fallback | [File:Tsarevo_Plazza_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:Tsarevo_Plazza_-_panoramio.jpg) | CC BY 3.0 | "Tsarevo Plazza - panoramio" by SpaceControl, via Wikimedia Commons, CC BY 3.0 |
| tsarevo-vasiliko | Tsarevo Vasiliko | area-fallback | [File:Tsarevo_Plazza_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:Tsarevo_Plazza_-_panoramio.jpg) | CC BY 3.0 | "Tsarevo Plazza - panoramio" by SpaceControl, via Wikimedia Commons, CC BY 3.0 |
| skalite | Skalite (The Rocks) | area-fallback | [File:Tsarevo_Plazza_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:Tsarevo_Plazza_-_panoramio.jpg) | CC BY 3.0 | "Tsarevo Plazza - panoramio" by SpaceControl, via Wikimedia Commons, CC BY 3.0 |
| lafina-north | Lafina North 1 | area-fallback | [File:Varvara_Beach_Dinev.jpg](https://commons.wikimedia.org/wiki/File:Varvara_Beach_Dinev.jpg) | CC BY 2.0 | "Varvara Beach Dinev" by Evgeni Dinev, via Wikimedia Commons, CC BY 2.0 |
| manastirich | Manastirich | area-fallback | [File:Varvara_Beach_Dinev.jpg](https://commons.wikimedia.org/wiki/File:Varvara_Beach_Dinev.jpg) | CC BY 2.0 | "Varvara Beach Dinev" by Evgeni Dinev, via Wikimedia Commons, CC BY 2.0 |
| varvara-north | Varvara North | exact | [File:Varvara_Beach_Dinev.jpg](https://commons.wikimedia.org/wiki/File:Varvara_Beach_Dinev.jpg) | CC BY 2.0 | "Varvara Beach Dinev" by Evgeni Dinev, via Wikimedia Commons, CC BY 2.0 |
| ahtopol-lighthouse | Ahtopol Lighthouse | area-fallback | [File:Ahtopol_beach_IFB.JPG](https://commons.wikimedia.org/wiki/File:Ahtopol_beach_IFB.JPG) | CC BY 2.5 | "Ahtopol beach IFB" by Nenko Lazarov, via Wikimedia Commons, CC BY 2.5 |
| ahtopol-north-west | Ahtopol North West Zone | area-fallback | [File:Ahtopol_beach_IFB.JPG](https://commons.wikimedia.org/wiki/File:Ahtopol_beach_IFB.JPG) | CC BY 2.5 | "Ahtopol beach IFB" by Nenko Lazarov, via Wikimedia Commons, CC BY 2.5 |
| listi | Listi | area-fallback | [File:Silistar_beach_-_rocks_pano.JPG](https://commons.wikimedia.org/wiki/File:Silistar_beach_-_rocks_pano.JPG) | CC BY-SA 3.0 | "Silistar beach - rocks pano" by Pudelek (Marcin Szala), via Wikimedia Commons, CC BY-SA 3.0 |
| silistar-north | Silistar North | area-fallback | [File:Silistar_beach_-_rocks_pano.JPG](https://commons.wikimedia.org/wiki/File:Silistar_beach_-_rocks_pano.JPG) | CC BY-SA 3.0 | "Silistar beach - rocks pano" by Pudelek (Marcin Szala), via Wikimedia Commons, CC BY-SA 3.0 |
| koral | Koral | exact | [File:Coral_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:Coral_-_panoramio.jpg) | CC BY-SA 3.0 | "Coral - panoramio" by zonemars, via Wikimedia Commons, CC BY-SA 3.0 |
| ayrodi-north | Ayrodi North | area-fallback | [File:Coral_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:Coral_-_panoramio.jpg) | CC BY-SA 3.0 | "Coral - panoramio" by zonemars, via Wikimedia Commons, CC BY-SA 3.0 |
| ayrodi-south | Ayrodi South | area-fallback | [File:Coral_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:Coral_-_panoramio.jpg) | CC BY-SA 3.0 | "Coral - panoramio" by zonemars, via Wikimedia Commons, CC BY-SA 3.0 |
| lipite | Lipite | area-fallback | [File:Coral_-_panoramio.jpg](https://commons.wikimedia.org/wiki/File:Coral_-_panoramio.jpg) | CC BY-SA 3.0 | "Coral - panoramio" by zonemars, via Wikimedia Commons, CC BY-SA 3.0 |
| rezovo-kastrich | Rezovo Kastrich | area-fallback | [File:Rezovo,_BUL_-_border_with_Turkey_-_beach.JPG](https://commons.wikimedia.org/wiki/File:Rezovo,_BUL_-_border_with_Turkey_-_beach.JPG) | CC BY-SA 3.0 | "Rezovo, BUL - border with Turkey - beach" by Pudelek (Marcin Szala), via Wikimedia Commons, CC BY-SA 3.0 |

## Summary

- Total missing beach ids (computed from `backend/src/infrastructure/seed/beachSeedData.ts` +
  `unguardedBeachSeedData.ts`, minus keys already in `frontend/src/shared/data/images/index.ts`):
  **106** (16 guarded + 90 unguarded).
- Exact matches: **32**
- Area-fallback matches: **74**
- Not found: **0**

## Not found

None — a free-license match (exact or area-level) was found on Wikimedia Commons for every one
of the 106 missing beach ids. If any of the above turn out on review to be a poor visual fit for
their beach (e.g. an area-fallback photo that doesn't read as a beach), the fix is to swap that
one block in `download-missing-images.sh` for a better source rather than treating it as
"not found" — no id needed to be dropped from this pass.
