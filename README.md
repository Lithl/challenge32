## "32 Deck Challenge" Visualizer
This application creates a diagram to visualize progress for the "32 Deck Challenge" some Magic: the
Gathering Commander players participate in. The challenge is to build a deck for each color
combination: 5 mono-color decks, 10 two-color decks 9one for each pair of the 5 colors), 10
three-color decks (the five Shards of Alara "shards" and the five Khans of Tarkir "wedges"), 5
four-color decks, a five-color deck, and a colorless deck.

The diagram allows the user to select color combinations from a compact layout, choose a Commander
which fits that color combination, and display that Commander's image in the appropriate region of
the diagram. Additional features, such as linking to deckbuilding websites to include deck lists,
and sharing the user's diagram are also planned. However, the aim of this project is to keep the
visualization lightweight.

### Building the application
After cloning the repository, install all dependencies with `npm install`. You will then be able to
compile the TypeScript into JavaScript and compile the SASS into CSS using `npm run build`.
Alternatively, if you intend to develop for the project, you can run `npm run watch` to rebuild when
changes are made.

### Running the application
Ultimately, this application will be hosted on its own website, accessible to all. However, if
you're developing for the project and want to run the application locally, you can use `node .`
while the project root is your current working directory. (Or from another directory, run `node` on
the project root.) The localhost server will run on port 3004.

### Running the application - Tutorial
1/ create a github account
2/ Install github desktop: https://desktop.github.com/
3/ install git: https://git-scm.com/downloads
4/ install node: https://nodejs.org/en/download/
5/ clone challenge32 : https://github.com/Lithl/challenge32 ("clone or download" then "open in dekstop"
6/ launch command prompt in challenge 32 cloning folder (should be C:\Users\Your Username\Documents\GitHub\challenge32), type "npm install", wait for the end of downloads
7/ type "npm run build"
8/ type "node ."           keep the cmd prompt open as long as you want to use the diagram
9/ copy "localhost:3004" in address bar of your web browsers and TADA it should work ! (not on firefox and internet explorer)

Now each time you want to reopen it you only have to open the cmd prompt challenge 32 cloning folder and redo the 8/ and 9/ steps

When an update on the app will happen you should:
- close every cmd prompt you have that are opened
- open github desktop software, click on fetch origin button
- open the cmd prompt in challenge 32 cloning folder
- type "npm run build", wait for the end and close the prompt
- You can access it with cmd prompt and 8/ and 9/ steps as usual
