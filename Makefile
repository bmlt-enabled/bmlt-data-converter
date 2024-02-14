COMMIT := $(shell git rev-parse --short=8 HEAD)
ZIP_FILENAME := "bmlt-data-converter.zip"
BUILD_DIR := "build"

help:  ## Print the help documentation
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: build
build:  ## Build
	npm run build
	git archive --format=zip --output=${ZIP_FILENAME} $(COMMIT)
	zip -r ${ZIP_FILENAME} dist
	cd public && zip -r ../${ZIP_FILENAME} * && cd ..
	mkdir -p ${BUILD_DIR} && mv ${ZIP_FILENAME} ${BUILD_DIR}

.PHONY: pages
pages:  ## Preps GitHub Pages Deploy
	mkdir -p pages && unzip ${BUILD_DIR}/${ZIP_FILENAME} -d pages

.PHONY: clean
clean:  ## clean
	rm -rf ${BUILD_DIR}
	rm -rf dist

.PHONY: image-build
image-build:  ## Builds Docker Image
	docker build -t bmlt-data-converter:latest .

.PHONY: image-serve
image-serve:  image-build ## Runs Docker Image
	docker run -it --rm --init -p 8000:8000 bmlt-data-converter:latest

.PHONY: image-exec
image-exec:  image-build ## Runs Docker Exec
	docker run -it bmlt-data-converter:latest /bin/sh

.PHONY: serve
serve:  ## serve
	python3 -m http.server 8000

.PHONY: lint
lint:  ## JS Lint
	npm run lint
	npm run prettier

.PHONY: lint-fix
lint-fix:  ## JS Lint Fix
	npm run lint:fix
	npm run prettier:fix
