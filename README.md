# serverless-python-uv-converter

You can use this together with `serverless-python-requirements` to dynamically generate requirements.txt using your `pyproject.toml` file.

How to use:
```yaml
# all of this is optional
custom:
  pythonUvConverter:
    overwrite: true # can overwrite existing requirements.txt files
    dependencyGroup: dev # if you have additional dependency groups you want to install.
    optionalDependencies: # fetch dependencies from [project.optional-dependencies]
      - aws
      - azure # can also be the string "all" to fetch all optional dependencies
    pyprojectPath: ../../pyproject.toml # Path to pyproject.toml (can be absolute or relative)
plugins:
    - serverless-python-uv-converter
    - serverless-python-requirements
```
