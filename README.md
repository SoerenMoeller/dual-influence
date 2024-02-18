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

### Building examples
A (not automated) way to build examples is examining a 3D-Plot and showing some gridlines. I used [c3d](https://c3d.libretexts.org/CalcPlot3D/index.html) with the function `7xy/e^(x^2 + y^2)` and `Number of Gridlines = 9`. The result is in [data/example2.json](data/example2.json). 