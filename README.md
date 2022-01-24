# NodeJSInstrumentPanel

# NJSControl: NodeJS Instrument Control Panel
A Node.js Express Web Framework control panel for lab instrument communication, data collection and visualization, and google drive cloud storage using the asynchronous event loop.

Harvard University Dept. of Physics, Mundy Lab

## Info
Software Developer: 
Raymond Jow
Advisors: 
Spencer Doyle
Julia Mundy

## Setup and Usage

1. Setup the [MongoDB Atlas Database](https://docs.atlas.mongodb.com/getting-started/)
2. Setup the [Google Picker API](https://developers.google.com/picker/docs/)
3. Paste the appropriate keys and URIs in a .env file with the following format
    ```
    # NodeJS
    PORT =
    
    # MongoDB
    DBURI =
    
    # Google Drive Auth and Picker API
    CLIENT_ID_AUTH =
    CLIENT_ID_DRIVE = 
    APP_ID = 
    DEV_KEY = 
    REDIRECT_URL = "http://localhost:3000/gd"
    TOKEN_PATH = "../../secrets/token.json"
    ```
4. Install node modules
    ```bash
    npm install
    ```

5. Run server
    ```bash
    npm run start
    ```

    
    


