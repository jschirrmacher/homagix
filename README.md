# homagix

Food shopping isn't fun. Especially if you have children and need or want to cook every day and those children aren't very interested in experimenting with new dishes. So, sonner or later, you will do the same few dishes again and again. I don't like this.

Sometimes, we _find_ some new dishes which are accepted by the children. I want to remember these. Unless then, I want to use all known dishes in a way that variety is maximized.

To do this in a more digital way, we created this repository to remember dishes, get more variety as well as simplify food shopping by having a list of ingredients which are needed for the dishes.

## Adding recipes

Dishes are stored in a `/data/dishes` folder using YAML format. This looks like in this example:

    ---
    name: Honig-Camembert
    items:
      - 4 Stk Camembert
      - 2 Stk Süßkartoffeln
      - 400 kg Äpfel
      - 200 g Instant-Linsen
      - 1 Bund Frühlingszwiebeln
      - 8 Stk Walnüsse
      - 200 g Rucola
      - 40 g Honig
      - 20 g Senf
    recipe: >
      Süßkartoffeln schälen und würfeln, in einem Topf mit Öl, Salz und Pfeffer
      vermengen und auf ein Backblech legen. Im Ofen ca. 20 Minuten backen. Linsen
      in klarem Wasser ausspülen. Äpfel waschen, entkernen und in Scheiben
      schneiden. Camemberts auf einem zweiten Backblech verteilen, mit der Hälfte
      des Honigs einstreichen und mit den Apfelscheiben dazwischen ca. 12 Minuten
      bei 180° im Ofen backen, bis der Apfel weich ist. In einer Pfanne die
      Frühlingszwiebelringe in Öl anschwitzen, Linsen dazu geben und 3 Minuten
      anbraten. Mit Salz und Pfeffer abschmecken. Restlichen Honig, Senf, Öl, 5 EL
      Wasser und etwas Essig in einer Salatschüssel zu einem Dressing mischen.
      Rucola und Linsen dazu geben und mit Salz und Pfeffer abschmecken.
    image: IMG_4055.jpg

The image must be placed in `/data/images`.

Make sure that you use the correct format `amount unit name` for each ingredient and use only the units
defined in https://github.com/jschirrmacher/homagix/blob/master/server/models/units.js

You need to restart the server when you add a new dish or make changes to an existing one.

## Install and run

    git clone https://github.com/jschirrmacher/homagix.git
    npm install --production
    npm start

There is also a Docker container available [here](https://hub.docker.com/r/joschi64/homagix)
