test:
	@./node_modules/mocha/bin/_mocha -R $(REPORTER)
test-cov:
	@./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- -R $(REPORTER)
.PHONY: test test-cov