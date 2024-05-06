# dual-influence


### Setup
There seem to be some bugs with older nodejs and npm versions. I recommend 
downloading a new one by installing nvm.

```sh
sudo apt remove nodejs
sudo apt install curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
nvm install 20.11.1
```

Now install the needed packages via npm:
```sh
npm install --save three
npm install --save-dev vite
```

### Run
Run via:
```sh 
npx vite
```

### Shortcuts
Use `ESC` to open the menu and `I` to change the camera mode between fixed and 
interactive.