.PHONY: pack publish test

pack:
	cd src && npm pack

publish:
	cd src && npm publish --access public

test:
	bash tests/test.sh
