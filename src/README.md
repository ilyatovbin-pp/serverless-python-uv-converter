
# serverless-python-uv-converter
Use this package together with `serverless-python-requirements` to generate a requirements.txt file from `pyproject.toml`

How to use:
```yaml
# everything is optional
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



## Source:

https://github.com/ilyatovbin-pp/serverless-python-uv-converter