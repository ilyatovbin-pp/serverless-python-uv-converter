#!/bin/bash
set -e

if [ -f "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
elif [ -f "$HOME/.zshrc" ]; then
  source "$HOME/.zshrc"
fi

echo "Running tests for serverless-python-uv-converter..."

cd src
echo "Installing plugin dependencies in src..."
npm install

cd ../tests/sls-project

echo "Installing local dependencies..."
npm install

echo "Cleaning up any old requirements.txt..."
rm -f ../my-custom-path/requirements.txt

echo "Running sls package..."
npx sls package

echo "Checking the generated requirements.txt..."
REQ_PATH="../my-custom-path/requirements.txt"

if [ ! -f "$REQ_PATH" ]; then
    echo "ERROR: requirements.txt was not generated at $REQ_PATH"
    exit 1
fi

CONTENTS=$(cat "$REQ_PATH")

echo "requirements.txt generated:"
echo "$CONTENTS"

if [[ "$CONTENTS" != *"requests==2.31.0"* ]]; then
    echo "ERROR: Missing requests dependency in generated requirements.txt"
    exit 1
fi

if [[ "$CONTENTS" != *"pytest==8.0.0"* ]]; then
    echo "ERROR: Missing pytest dependency (from dependencyGroup: dev)"
    exit 1
fi

if [[ "$CONTENTS" != *"requests-aws4auth"* ]]; then
    echo "ERROR: Missing requests-aws4auth dependency (from optionalDependencies: aws)"
    exit 1
fi

if [[ "$CONTENTS" != *"azure"* ]]; then
    echo "ERROR: Missing azure dependency (from optionalDependencies: azure)"
    exit 1
fi

echo "======================================"
echo "TEST 2: Disabling overwrite..."

sed -i.bak 's/overwrite: true/overwrite: false/g' serverless.yml

# It should say requirements.txt already exists. Let's capture the output
OUTPUT=$(NO_COLOR=1 npx sls package 2>&1 || true)

if [[ "$OUTPUT" != *"already exists, skipping generation"* ]]; then
    echo "ERROR: Did not skip overwrite properly when overwrite=false."
    exit 1
fi

# rollback configuration
mv serverless.yml.bak serverless.yml

echo "All tests passed successfully!"
