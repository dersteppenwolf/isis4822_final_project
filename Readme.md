# Rheumatoid Arthritis in Colombia

Final Project for  Class *ISIS 4822 -  Visual Analytics - Universidad de los Andes* http://johnguerra.co/classes/visual_analytics_fall_2018/

- [Rheumatoid Arthritis in Colombia](#rheumatoid-arthritis-in-colombia)
    - [Related Links](#related-links)
    - [Description](#description)
        - [Main Goal of the Project](#main-goal-of-the-project)
        - [Justification](#justification)
    - [About the Author](#about-the-author)
        - [Juan Carlos Méndez](#juan-carlos-m%C3%A9ndez)
    - [Who ?](#who)
    - [What ?](#what)
    - [Why ?](#why)
    - [How ?](#how)
    - [Insights](#insights)
    - [Tech Stuff](#tech-stuff)
        - [Technologies / Apis used](#technologies--apis-used)
        - [Running the App](#running-the-app)
        - [Source code](#source-code)
        - [Development](#development)
    - [Screenshots](#screenshots)
    - [Other Links / References](#other-links--references)
        - [Crossfilter](#crossfilter)

## Related Links

* Demo: http://jcmendez.gkudos.com/ar/
* Slides: 
* Videos: 
* Paper: 


## Description

Rheumatoid arthritis (RA) is an autoimmune disease that can cause joint pain and damage throughout your body. There's no cure for RA, but there are treatments that can help you to manage it. It is considered as a high-cost disease. In addition to to physical and emotional pain,  the economic costs associated are high. 

###  Main Goal of the Project

The following work tries to bring a *visual analytics* tool that could help to  understand the impact  of Rheumatoid Arthritis (RA) in Colombia  in terms of the economical costs associated with it.   The cost of procedures vary from  state, regime, age, administrator, provider, etc.  Using a visual tool could help the experts to explore and understand the available data. 

Costs of procedures related to RA are extracted from SISPRO ( [Sistema Integral de Información de la Protección Social](http://www.sispro.gov.co/) )   in the period from 2010 to 2017.

###  Justification

* In recent years there has been an increase in the prevalence of the disease in the country.
* At the moment there are not enough available tools that allow to explore RA data in a  user friendly way.


## About the Author 

### Juan Carlos Méndez

**Email**: jc.mendez[~at~]uniandes.edu.co , juan[~at~]gkudos.com

**Twitter**: @dersteppen

**Github**: https://github.com/dersteppenwolf

**Web**: https://neogeografia.wordpress.com/


## Who ? 

users... 


## What ?

data...

## Why ?

data...

## How ?

data...

## Insights

data...

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

### Running the App

You only need it a web server enabled to serve static content e.g. Apache Web Server. 
Code and data files (html, css, js,  json, tsv ) are included in the _app_ folder.

If you use Python 3, you could  run a simple http server using the following commands:

    cd app
    python3 -m http.server

Then you can open a web browser using the following url:

    http://localhost:8000/

### Source code

You can find the source coude in the _app_ folder.

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

## Other Links / References

###  Crossfilter

Crossfilter is a JavaScript library for exploring large multivariate datasets in the browser. 

Crossfilter2 ( https://github.com/crossfilter/crossfilter )  is a community-maintained fork of the original square/crossfilter ( https://github.com/square/crossfilter ) library. 

Crossfilter2 can be a little confusing at the beginning. The following links include some useful programming examples to start with.  

* Api Reference https://github.com/crossfilter/crossfilter/wiki/API-Reference
* Explore Your Multivariate Data with Crossfilter http://eng.wealthfront.com/2012/09/05/explore-your-multivariate-data-with-crossfilter/ http://jsfiddle.net/hitch17/vSUte/ 
* Example https://bl.ocks.org/micahstubbs/66db7c01723983ff028584b6f304a54a
* Example worldbank crossfilter https://drarmstr.github.io/chartcollection/examples/#worldbank/
* https://blog.sicara.com/interactive-dashboard-crossfilter-dcjs-tutorial-7f3a3ea584c2 
















