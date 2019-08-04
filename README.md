### VSCodeワークスペース設定
```bash
$ cat *.code-workspace
{
	"folders": [
		{
			"path": "."
		}
	],
	"settings": {
		"terminal.integrated.env.windows": {
			"PATH": "${env:PATH};${workspaceRoot}\\node_modules\\.bin"
		}
	}
}
```

### npm設定

```bash
npm init #適当に情報入力
npm install --save-dev \
  ts-loader \
  tslint \
  typescript \
  webpack \
  webpack-cli \
  webpack-dev-server
```

### TypeScript設定
```bash
tslint --init
tsc --init
```

### webpack設定
```bash
$ cat webpack.config.js
const path = require('path');

module.exports = {
    entry: {
        index: './src/index.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    devServer: {
        contentBase: 'html',
        port: 3000
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    module: {
        rules: [{
            test: /\.ts$/,
            exclude: [/node_modules/],
            use: [
                'ts-loader'
            ]
        }]
    }
};
```