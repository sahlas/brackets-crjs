brackets-complexityReport
=========================

A Brackets extension that enables phil booth's  complexityReport.js tool.  


## Installation
* In Brackets go to Help -> Show Extension Folder and locate the user folder.
* Unzip this extension to the user extension folder. 

## Usage
When this feature is enabled you'll get complexity stats about your javascript code which you are currently editing.  Go to View -> Enable Metrics

Currently the tool reports on:

* lines of code
* cyclomatic complexity
* Halstead metrics
* maintainability index.

## Implementation Notes
This feature uses node that is integrated in the Brackets shell.  To learn more about this feature in Brackets you should review https://github.com/adobe/brackets/wiki/Brackets-Node-Process:-Overview-for-Developers

Let me know if you have any suggestions or issues.  Contact me at: bsahlas@adobe.com. 

## Change Log
* 3/8/13 - updates and refactoring in main.js and node/ComplexityReportDomain.js 
* 3/13/13 - added help documentation and polished up the report display and condensed README.md