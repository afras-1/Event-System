# Eventual Events Management System

![Eventual Logo](/src/assets/images/logo.png)

Hey there! If you're seeing this, you're looking to host the Eventual Events Management Website on your device! This guide will help you understand what you need to do to set up the website and the server.

To get the site and the server up and running, follow these steps!

### 1. Install

First, you'll need to install 3 things. Firstly, of course, you'll need to download the code from the Github repository if you haven't already. You can do that from this link:
**[Github](https://github.com/afras-1/Event-System)**

You'll want to download the code as a ZIP file by using this option:

![Download as ZIP](/readme-assets/downloadaszip.bmp)

Once you've gotten the code downloaded and extracted, you should open a command line in that directory! Hold shift and right click in the folder until you see the `Open in Terminal` or `Open in Powershell` option.

![Open in Terminal](/readme-assets/openinterminal.bmp)

If that option doesn't show up, alternatively, you can hold the `Windows Key` and `R` to open the Run Program dialogue box. Then, you type `cmd` to start the command line. 
- Only if you used the `Win+R` method, do the following:
- Type `cd` but do not press enter
- Find your file ("event-system" or "event-system-main") in the Windows file browser
- Drag that file into the command line window
- The command should now read `cd` followed by a file path.
- Hit enter.

![Paste Path to File](/readme-assets/pastepathtofile.bmp)
![Path Pasted](/readme-assets/pathpasted.bmp)

Once you've got a command line open in the extracted files, type `npm install`. This will automatically install most of the required modules.
Then, type `npm rebuild` to ensure the modules have built properly

At this point, the website is ready to start. However, you will still need to set up the database.

To do this, you'll need to install Node JS to run the database. You can get this at
**[Node](https://nodejs.org/en)**

![Download Node](/readme-assets/downloadnode.bmp)

Once you download the installer, run it and the setup wizard will guide you through the options. The default settings are fine.

### 2. Run

Once you've installed both npm and Node, you'll need to open a new command line window. Open this in the `server` file inside your main folder.
![Command Line opened in Server folder](/readme-assets/servercommandline.bmp)

Then, run the commands `node seed.js` and `node index.js` (this will fill the database with data and start the database server)
![Expected output from the node seed and node index commands](/readme-assets/nodeindex.bmp)

Finally, open another command line in the main folder (following the instructions above) and type `npm start`.
The website should launch to the homepage.

![Homepage](/readme-assets/homepage.bmp)

