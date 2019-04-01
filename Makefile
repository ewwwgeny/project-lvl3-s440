install:
	npm install

build:
	rm -rf dist
	NODE_ENV=production npx webpack

publish:
	npm publish

lint:
	npx eslint ./

develop:
	npm run webpack-server

deploy:
	make build
	surge ./dist --domain ewwwgeny.surge.sh
