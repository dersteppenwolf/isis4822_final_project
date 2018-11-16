# ETL 

## Description

Source data is publised as a datacube using Microsoft Analysis Services.
In order to extract data for visualizations the following process was made:
    
* Create a Tableau workbook on a windows machine
* Connect the datasource to the datacube on Microsoft analysis services.
* Create a Worksheet with the filters of interest and add dimensions (rows) and measures (columns)
* Export data as CSV using "Analysis / View Data / Export All"
* Process csv (ie. filtering, cleaning) using Python / Jupyter Lab 
* Save results as tsv, csv or json


## Other tools  

* TSV to JSON Converter https://codebeautify.org/tsv-to-json-converter
* JSONJSONLint - The JSON Validator https://jsonlint.com/