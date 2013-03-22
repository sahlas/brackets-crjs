/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/*global define, brackets, $, window, PathUtils */

define(function (require, exports, module) {
    "use strict";
    // load modules
    var CommandManager          = brackets.getModule("command/CommandManager"),
        EditorManager           = brackets.getModule("editor/EditorManager"),
        DocumentManager         = brackets.getModule("document/DocumentManager"),
        Menus                   = brackets.getModule("command/Menus"),
        NativeFileSystem        = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        FileUtils               = brackets.getModule("file/FileUtils"),
        Dialogs                 = brackets.getModule("widgets/Dialogs"),
        AppInit                 = brackets.getModule("utils/AppInit"),
        Resizer                 = brackets.getModule("utils/Resizer"),
        // node modules
        ExtensionUtils          = brackets.getModule("utils/ExtensionUtils"),
        NodeConnection          = brackets.getModule("utils/NodeConnection"),
        // local vars and config file
        moduleDir               = FileUtils.getNativeModuleDirectoryPath(module),
        configFile              = new NativeFileSystem.FileEntry(moduleDir + '/config.js'),
        config                  = { options: {}, globals: {} },
        report                  = null, 
        _enabled                = false,
        TOGGLE_REPORT           = "quality.metrics.ComplexityReport",
        content                 = require("text!templates/CRJSPanel.html");
    
    function getEnabled() {
        return _enabled;
    }
    
    function handleShowCR() {
        if (getEnabled()) {
            //add the HTML UI
            $(content).insertBefore("#status-bar");
            Resizer.makeResizable($('#panel1').get(0), "vert", "top", 100);
            Resizer.makeResizable($('#panel2').get(0), "vert", "top", 200);
            $('#panel1 .close').click(function () {
                CommandManager.execute(TOGGLE_REPORT);
            });
            
            $('#panel1').show('fast', function () {
                alignMenuItems();
            });
            $('#panel2').show();
            $(DocumentManager).on("currentDocumentChange documentSaved", node);
        } else {
            $('#panel1').hide();
            $('#panel2').hide();
            $(DocumentManager).off("currentDocumentChange documentSaved", null,  node);
        }
        EditorManager.resizeEditor();
    }

    function alignMenuItems() {
        if (getEnabled()) {
            // line up the links on the title band
            var closeElt = $("#crjs-close");
            var closeEltPos = closeElt.offset();
            var helpElt = $("#crjs-help");
            closeEltPos.left += -60;
            helpElt.offset(closeEltPos);
            
            var optionsElt = $("#crjs-options");
            var helpEltPos = helpElt.offset();
            helpEltPos.left += -60;
            helpEltPos.top += 0;
            optionsElt.offset(helpEltPos);
        }
    }

    function node() {
        var currentDoc = DocumentManager.getCurrentDocument();
        if (currentDoc === null) {
            return;
        }
        var text = currentDoc.getText();
        
        // Create a new node connection
        var nodeConnection = new NodeConnection();

        // Helper function to connect to node
        function connect() {
            var connectionPromise = nodeConnection.connect(true);
            connectionPromise.fail(function () {
                console.error("[brackets-complexity-report] failed to connect to node");
            });
            return connectionPromise;
        }
        
        // Helper function that loads our domain into the node server
        function loadComplexityReportDomain() {
            var path = ExtensionUtils.getModulePath(module, "node/ComplexityReportDomain");
            var loadPromise = nodeConnection.loadDomains([path], true);
            loadPromise.fail(function () {
                console.log("[brackets-complexity-report] failed to load ComplexityReportDomain");
            });
            return loadPromise;
        }

        function getComplexityReport() {
            var reportPromise = nodeConnection.domains.crDomain.getComplexityReport(text, config.options);
            reportPromise.fail(function (err) {
                console.error("[brackets-complexity-report] failed to run ComplexityReportDomain.getComplexityReport", err);
            });
            reportPromise.done(function (results) {
                // set the global 'report' var to the result of this call
                report = results.report;
                // once results are available repaint/reshow the report
                showComplexityReport();
            }).fail(function (error) {
                //showError(error);
                $("#panel1 .table-container")
                    .empty()
                    .append("<p>&nbsp;&nbsp;&nbsp;&nbsp; No results for this file.</p>");
                $("#panel2 .table-container").hide();
            });

            return reportPromise;
        }
        
        function showComplexityReport() {
            $("#panel2 .table-container").show();
            var $selectedRow;
            var makeCell = function (content) {
                return $("<td width='200'/>").text(content);
            };
            var headerTable         = $("<table class='zebra-striped condensed-table' style='overflow:hidden;'/>").append("<tbody>");
            var aggregateHeaders    = $("<tr style='font-size: small'><th>Maintainability Index</th><th>Physical LOC</th><th>Logical LOC</th><th>Cyclomatic Complexity</th></tr>")
                                        .appendTo(headerTable);
            var aggregateHeaderRow           = $("<tr/>")
                                        .append(makeCell(report.maintainability.toFixed(2)))
                                        .append(makeCell(report.aggregate.complexity.sloc.physical))
                                        .append(makeCell(report.aggregate.complexity.sloc.logical))
                                        .append(makeCell(report.aggregate.complexity.cyclomatic))
                                        .appendTo(headerTable);
           
            var itemHeaders         = "<tr style='font-size: small'><th width='200'>Line</th>"
                                    + "<th width='200'>Function</th><th width='200'>Physical LOC</th><th width='200'>Logical LOC</th>"
                                    + "<th width='200'>Cyclomatic Complexity</th><th width='200'>Halstead Difficulty</th>"
                                    + "<th width='200'>Halstead Volume</th><th width='200'>Halstead Effort</th></tr>";
            $(headerTable).append(itemHeaders);
            
            var itemTable           = $("<table class='zebra-striped condensed-table' />").append("<tbody>");

            report.functions.forEach(function (item) {
                if (item) {
                    var $row = $("<tr style='font-size: small'/>")
                            .append(makeCell(item.line))
                            .append(makeCell(item.name))
                            .append(makeCell(item.complexity.cyclomatic))
                            .append(makeCell(item.complexity.sloc.logical))
                            .append(makeCell(item.complexity.sloc.physical))
                            .append(makeCell(item.complexity.halstead.difficulty.toFixed(2)))
                            .append(makeCell(item.complexity.halstead.volume.toFixed(2)))
                            .append(makeCell(item.complexity.halstead.effort.toFixed(2)))
                            .appendTo(itemTable);
                    
                    $row.click(function () {
                        var editor = EditorManager.getCurrentFullEditor();
                        if ($selectedRow) {
                            $selectedRow.removeClass("selected");
                        }
                        $row.addClass("selected");
                        $selectedRow = $row;
                        
                        editor.setCursorPos(item.line - 1, item.col - 1);
                        EditorManager.focusEditor();
                    });
                }
            });
            
            $("#panel1 .table-container").empty().append(headerTable);
            $("#panel2 .table-container").empty().append(itemTable);
            
            EditorManager.resizeEditor();
        }
        // Call all the helper functions in order
        chain(connect, loadComplexityReportDomain,  getComplexityReport);
    }
    
    // Helper function that chains a series of promise-returning functions together via their done callbacks.
    function chain() {
        var functions = Array.prototype.slice.call(arguments, 0);
        if (functions.length > 0) {
            var firstFunction = functions.shift();
            var firstPromise = firstFunction.call();
            firstPromise.done(function () {
                chain.apply(null, functions);
            });
        }
    }

    function showError(error) {
        Dialogs.showModalDialog(
            Dialogs.DIALOG_ID_ERROR,
            "Error",
            ": " + error
        );
    }

    function updateListeners() {
        if (getEnabled()) {
            
            // register our event listeners
            $(DocumentManager)
                .on("currentDocumentChange.crjs", function () {
                    node();
                })
                .on("documentSaved.crjs documentRefreshed.crjs", function (event, document) {
                    if (document === DocumentManager.getCurrentDocument()) {
                        node();
                    }
                });
            
        } else {
            $(DocumentManager).off(".crjs");
        }
    }
    
    function _setEnabled(enabled) {
        _enabled = enabled;
        CommandManager.get(TOGGLE_REPORT).setChecked(_enabled);
        updateListeners();
        handleShowCR();
        node();
    }
    
    // Command to toggle enablement 
    function _handleToggleCRJS() {
        if (getEnabled()) {
            _enabled = false;
        } else {
            _enabled = true;
        }
        _setEnabled(_enabled);
    }
    
    // Register command handler
    CommandManager.register("Complexity Report", TOGGLE_REPORT, _handleToggleCRJS);
    
    AppInit.htmlReady(function () {
        // Called on HTML ready to trigger the initial UI
        init();
    });
    
    function init() {
        Window.prototype.onresize = function () {
            console.log("resizing window");
            if (_enabled) {
                alignMenuItems();
            }
        };
        
        FileUtils.readAsText(configFile)
            .done(function (text, readTimestamp) {
    
                //try to parse the config file
                try {
                    config = JSON.parse(text);
                } catch (e) {
                    console.log("Can't parse config file " + e);
                    showError();
                }
            })
            .fail(function (error) {
                showError();
            })
            .then(function () {
                var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
                menu.addMenuItem(TOGGLE_REPORT, "", Menus.AFTER, "menu-view-sidebar");

            });
    }
    
    exports.init = init;
   
});