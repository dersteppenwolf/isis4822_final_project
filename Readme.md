# Dashboard to analyze Rheumatoid Arthritis in Colombia based on Costs per Person

Final Project for  Class *ISIS 4822 -  Visual Analytics - Universidad de los Andes* http://johnguerra.co/classes/visual_analytics_fall_2018/

![alt text](https://raw.githubusercontent.com/dersteppenwolf/isis4822_final_project/master/media/dashboard.png "Visualization")






- [Dashboard to analyze Rheumatoid Arthritis in Colombia based on Costs per Person](#dashboard-to-analyze-rheumatoid-arthritis-in-colombia-based-on-costs-per-person)
    - [Main Links](#main-links)
    - [Description](#description)
        - [Main Goal of the Project](#main-goal-of-the-project)
        - [Justification](#justification)
    - [About the Author](#about-the-author)
        - [Juan Carlos Méndez](#juan-carlos-m%C3%A9ndez)
    - [Who?](#who)
    - [What?](#what)
        - [Data](#data)
        - [Derived](#derived)
    - [Why?](#why)
        - [Main Task](#main-task)
        - [Secondary Tasks](#secondary-tasks)
    - [How?](#how)
        - [Idiom : Horizontal / Vertical Bar Charts](#idiom--horizontal--vertical-bar-charts)
        - [Idiom : List](#idiom--list)
        - [Idiom : Grid Map](#idiom--grid-map)
    - [Insights](#insights)
    - [Tech Stuff](#tech-stuff)
        - [Technologies / Apis used](#technologies--apis-used)
        - [Running the App](#running-the-app)
        - [Source code](#source-code)
            - [ETL](#etl)
            - [Web Application](#web-application)
        - [Development](#development)
    - [Screenshots](#screenshots)
    - [Other Links / Docs](#other-links--docs)
        - [Crossfilter](#crossfilter)

## Main Links

* Demo: http://jcmendez.gkudos.com/ar/
* Slides: 
* Videos: 
* Paper: 


## Description

Rheumatoid arthritis (RA) is an autoimmune disease that can cause joint pain and damage throughout your body. There's no cure for RA, but there are treatments that can help you to manage it. In addition to to physical and emotional pain,  the economic costs associated are high. In general, it is considered as a **high-cost** disease. 

###  Main Goal of the Project

The following work tries to bring a **visual analytics** tool that could help to  understand the impact  of Rheumatoid Arthritis (RA) in Colombia  in terms of the economical costs associated with it.   The cost of procedures vary from  state, regime, age, administrator, provider, etc.  Using a visual tool could help the experts to explore and understand the available data. 

Costs of procedures related to RA are extracted from SISPRO ( [Sistema Integral de Información de la Protección Social](http://www.sispro.gov.co/) )   in the period from 2010 to 2017.

###  Justification

* In recent years there has been an increase in the prevalence of the disease in the country.
* At the moment there are not enough available tools that allow to explore RA data in a  user friendly way.


## About the Author 

### Juan Carlos Méndez

**Email**: jc.mendez[~at~]uniandes.edu.co , juan[~at~]gkudos.com

**Twitter**:  [@dersteppen](https://twitter.com/dersteppen)

**Github**: https://github.com/dersteppenwolf

**Web**: https://neogeografia.wordpress.com/


## Who? 

This visualization is intended for Physicians and Health professional interested in occurrence of Rheumatoid arthritis (RA) in Colombia.


## What?

### Data 

* Main Dataset: SISPRO
* Description: Administrative Database with Medical services given to patients in Colombian health system, filtered by Diagnostic codes for Rheumatoid Arthritis.
* Source: [SISPRO](http://www.sispro.gov.co/ )  
* Source Type: Microsoft analysis services  data cube
Cube: CU - Prestación Servicios de Salud
* Dataset Type: Table, Temporal
* Attributes
    * States : Categorical. States of Colombia
    * Year: Categorical, orderered, sequential. Year of the procedure.
    * Regime :  Categorical.  Type of health regime to which the patient belongs
    * Sisben : Categorical. Subtype of Subsidized regime. 
    * Sex : Categorical.
    * Age Group: Categorical, ordered. Age Groups classified by human cycle. 
    * Administrator: Categorical. Administrators of the Social Security System
    * Provider: Categorical. Company that provides a medical service.
    * Procedure: Categorical. Procedures and medical services performed in
Colombia
    * Procedure Cost: Quantitative, ordered, sequential.  Cost of a procedure applied to a patient.
    * People Served : Quantitative, ordered, sequential. Number of people 

### Derived

**Categorical**

Most categorical attributes from raw data  are  long strings that  repeat  many times. The size of original CSV file is 456 MB. Such kind of _"big"_ file can generate a lot of latency during downloads for _"normal"_ web clients.  To avoid that kind of problem, data is derived in two files: 
* A lookup table (_domains.json - 1 MB_)
* Encoded rows  (_costs.tsv - 20.4 MB_)

Encoding was made as follows:
* Extract ids / codes from original strings for States,  Administrators,  providers and procedures
* Generate ids for regime, sisben, sex and age.

**Geo**

The geo data of the States used for the map (_colombia_index.geojson_) is a simplification of the original  polygons from [OSM](https://www.openstreetmap.org). 
The derived file tries to reflect a ["Grid Map"](https://forumone.com/ideas/good-data-visualization-practice-tile-grid-maps-0) for Colombia that allows the user to easily identify a State for interactive widgets based on the bounding boxes of the 25k scale grid of Colombia. It was made with Postgis and QGIS. 


![geo](https://raw.githubusercontent.com/dersteppenwolf/isis4822_final_project/master/media/geo.png "geo")




## Why?

### Main Task

**Discover** the  **distribution** of _Costs per Person (CP)_  of RA procedures in Colombia by state, year, regime, sisben, sex, age group,  administrator and provider.

### Secondary Tasks

* **Derive** attributes from raw data as **features** to be used in  the final visualization.
* **Identify** **Outliers**  in costs.
* **Identify** the **Features** of a specific procedure in the dataset. 
* **Summarize** the **distribution** of Costs per Person, people served and total costs   of RA procedures in Colombia.

## How?

The dashboard uses different idioms / widgets with Different encodings for all data with Linked filtering (Crossfiltering).

### Idiom : Horizontal / Vertical Bar Charts

**Encode**

* Attributes: Year, State, Regime, Sisben, sex, age, administrator, provider
* Mark: Line
* Channel 
    * Position: Key attribute. Horizontal / Vertical.
    * Color:  Selection / Hover
* Encode: Separate, Order, Align.

 
**Manipulate**
* Select and Highlight: Click / Hover
* Navigate: Attribute Reduction, Slice
* Change with Animated Transitions

**Facet** 
* Juxtapose 
* Linked Filtering (Crossfiltering)

**Reduce**

* Filter Items / Attributes 
* Aggregate Attributes 

### Idiom : List

**Encode**

* Attributes: Procedure Name, Cups, Cost per Person, Persons attended, total costs.
* Mark: Line
* Channel 
    * Position: Vertical,  Key attribute (Cups). Horizontal: other attributes
    * Color:  Selection  
* Encode: Separate, Order
  
**Manipulate**
* Select 
* Reorder

**Facet** 
* Juxtapose 
* Linked Filtering (Crossfiltering)

### Idiom : Grid Map

**Encode**

* Attributes: State
* Mark: Area
* Channel 
    * Spatial Region
    * Color:  Selection  

**Manipulate**
* Select 

**Facet** 
* Juxtapose 
* Linked Filtering (Crossfiltering)



## Insights

* There are quality problems in data like these:
    * Some states do not have data for one or more years (e.g Amazonas, Arauca, Casanare, Guainía, Guaviare)
    * There are "Not Reported - NR" and  "Not Available - NA",  values in some of the attributes.  Such kind of _"data loss"_ problem should be mitigated by data publishers in order to improve the general data quality of the dataset.
* The overall average of Costs per Person for procedures is higher for younger people.
* There are  outliers in procedure costs that reflect problems during data collection or reporting (e.g. procedures with cost of $1 COP)
*  




## Tech Stuff


### Technologies / Apis used

* D3 v5.7.0 https://github.com/d3/d3/releases/tag/v5.7.0
* Crossfilter2  v1.4.6 https://github.com/crossfilter/crossfilter
* AngularJS 1.6.6  https://angularjs.org/
* Angular UI Grid 4.6.6 http://ui-grid.info/
* Bootstrap 4.1.3  http://getbootstrap.com/
* Google Fonts
* Font Awesome
* Gulp: https://gulpjs.com/
* Jupyter / Jupyter Lab 
* Visual Studio Code
* Tableau (Note: Used only for data extraction from [Microsoft Analysis Services](https://en.wikipedia.org/wiki/Microsoft_Analysis_Services )

### Running the App

You only need it a web server enabled to serve static content e.g. Apache Web Server. 
Code and data files (html, css, js,  json, tsv ) are included in the _app_ folder.

If you use Python 3, you could  run a simple http server using the following commands:

    cd app
    python3 -m http.server

Then you can open a web browser using the following url:

    http://localhost:8000/

### Source code

#### ETL

You can find the ETL's source coude in the _etl_ folder.
That folder includes a tableau workbook used as a tool for data extraction from SISPRO's Analysis Services Data Cube. 
(Note: It only works on windows machines.  For more information about connect Tableau to a Microsoft Analysis Services database and set up a data source please read the  [official docs](https://onlinehelp.tableau.com/current/pro/desktop/en-us/examples_msas.htm) )

There are some [Jupyter](http://jupyter.org/)  notebooks like __costos_20181122.ipynb__ is used for data validation / transformation.

#### Web Application

You can find the source code in the _app_ folder.

Subfolders:

*    css	
*    data	
*    img	
*    js	: Custom Source Code
*    js/libs : External Libraries	
*    pages : Html templates for AngularJs

Relevant files:

* *index.html* : Main html file
* *js/costsController.js* : Controller of the Costs visualization view.
* *pages/costs.html* : Html template for visualization
* *js/categoryChartDirective.js* : Implementation of an AngularJS Directive using D3  to visualize categorical data as a customized horizontal barchart.  
* *js/barChartDirective.js* : Implementation of an AngularJS Directive using D3  to visualize categorical data as a customized  barchart.  
* *js/colombiaMapDirective.js* : Implementation of an AngularJS Directive using D3  to visualize a simplified map of Colombia used  as a tool for quick lookups for states  .  
* *js/dataTableChartDirective.js* : Implementation of an AngularJS Directive using Angular UI Grid to visualize tabular data related to procedures costs.



### Development

App source code:

    cd app/

Dependencies: 

    npm install gulp
    npm install

To ease local development  you can use gulp for hot reloading:

    gulp watch



## Screenshots

![alt text](https://raw.githubusercontent.com/dersteppenwolf/isis4822_final_project/master/media/dashboard.png "Visualization")

![alt text](https://raw.githubusercontent.com/dersteppenwolf/isis4822_final_project/master/media/top.png "Years / Main Cards")

![alt text](https://raw.githubusercontent.com/dersteppenwolf/isis4822_final_project/master/media/states.png "States")

![alt text](https://raw.githubusercontent.com/dersteppenwolf/isis4822_final_project/master/media/admins.png "Admins")

![alt text](https://raw.githubusercontent.com/dersteppenwolf/isis4822_final_project/master/media/providers.png "Providers")

![alt text](https://raw.githubusercontent.com/dersteppenwolf/isis4822_final_project/master/media/category2.png "category")

![alt text](https://raw.githubusercontent.com/dersteppenwolf/isis4822_final_project/master/media/table2.png "Detail table")

## Other Links / Docs

###  Crossfilter

Crossfilter is a JavaScript library for exploring large multivariate datasets in the browser. 

Crossfilter2 ( https://github.com/crossfilter/crossfilter )  is a community-maintained fork of the original square/crossfilter ( https://github.com/square/crossfilter ) library. 

Crossfilter2 can be a little confusing at the beginning. The following links include some useful programming examples to start with.  

* Api Reference https://github.com/crossfilter/crossfilter/wiki/API-Reference
* Explore Your Multivariate Data with Crossfilter http://eng.wealthfront.com/2012/09/05/explore-your-multivariate-data-with-crossfilter/ http://jsfiddle.net/hitch17/vSUte/ 
* Example https://bl.ocks.org/micahstubbs/66db7c01723983ff028584b6f304a54a
* Example worldbank crossfilter https://drarmstr.github.io/chartcollection/examples/#worldbank/
* https://blog.sicara.com/interactive-dashboard-crossfilter-dcjs-tutorial-7f3a3ea584c2 
















