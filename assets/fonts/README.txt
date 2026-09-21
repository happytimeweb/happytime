HAPPY-TIME — brand fonty

Tento priečinok je určený pre webfonty vo formáte .woff2.
Súbory fontov nie sú súčasťou projektu ani pôvodného ZIP balíka.
Použite súbory s licenciou umožňujúcou ich nasadenie na tomto webe.

AKTUÁLNA KONFIGURÁCIA
Definície @font-face sú v assets/css/style.css, nie v index.html.
Z CSS sa fonty načítavajú relatívnou cestou ../fonts/.
Aktuálny stylesheet očakáva tieto presné názvy a váhy:

  HurmeGeometricSans-Light.woff2      — Hurme Geometric Sans, 300
  HurmeGeometricSans-Regular.woff2    — Hurme Geometric Sans, 400
  HurmeGeometricSans-SemiBold.woff2   — Hurme Geometric Sans, 600
  HurmeGeometricSans-Bold.woff2       — Hurme Geometric Sans, 700
  EldwinScript-Regular.woff2         — Eldwin Script, 400

POSTUP
1. Pripravte zodpovedajúce webfonty a vložte ich do assets/fonts/
   s názvami uvedenými vyššie.
2. Ak majú súbory iné názvy alebo váhy, upravte zodpovedajúce src
   a font-weight v assets/css/style.css.
3. Publikujte zmeny a v prehliadači overte načítanie fontov aj vzhľad
   bežného textu, nadpisov a tučných rezov.

NÁHRADNÉ FONTY
Premenná --font-sans používa Hurme Geometric Sans, potom Figtree
  a systémové bezpätkové fonty.
Premenná --font-script používa Eldwin Script, potom Caveat a cursive.
Figtree a Caveat sa načítavajú cez Google Fonts odkaz v index.html.
Pri doplnení súborov pod očakávanými názvami netreba spájať ani
presúvať HTML, CSS alebo JavaScript.

AKTUALIZÁCIA UŽ PUBLIKOVANÝCH FONTOV
Pravidlo /assets/* v netlify.toml zahŕňa aj fonty a CSS a nastavuje
ročnú cache s immutable. Pri nahradení existujúceho fontu použite
nový názov súboru, upravte jeho src v CSS a zmeňte aj URL upraveného
CSS v index.html. Podrobnosti sú v CITAJ-MA.txt v koreni projektu.
