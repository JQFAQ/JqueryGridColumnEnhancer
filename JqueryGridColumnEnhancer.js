(function ($) {

    $.fn.columnResize = function (options) {
        var $document = $(document);
        // Establish our default settings
        var settings = $.extend({
            minWidth: 20,
            EnableColumnHeaderContextMenu: false
        }, options);

        var colWidth, startX, gridBody, gridHeadTable, gridHeadtr, $colElementHeader, $colElementBody, gridHeadth, tapDownX = null, tapDownY = null, touchStartTime = null;
        mousedown = function (event) {
            if ($(gridHeadth[colIndex - 1]).hasClass("rq-column-width-readonly")) {
                event.preventDefault();
                return;
            }

            var event = (event.originalEvent.touches) ? event.originalEvent.touches[0] : event;
            startX = event.clientX;
            var colIndex = $(event.currentTarget).closest("th")[0].cellIndex + 1;
            $colElementHeader = gridHeadTable.find("colgroup > col:nth-child(" + colIndex + ")");
            $colElementBody = gridBody.find("colgroup > col:nth-child(" + colIndex + ")");
            if (gridHeadth.length <= 2)
                colWidth = gridHeadth.width();
            else
                if ($colElementHeader.get(0) == undefined)
                    return;
                else
                //TODO: Use jquery width()
                    colWidth = parseInt($colElementHeader.get(0).style.width, 10);


            $document.bind("mousemove.columnResizer", mouseMove);
            $document.bind("touchmove.columnResizer", mouseMove);
            event.preventDefault();
        }

        mouseMove = function (event) {
            var event = (event.originalEvent.touches) ? event.originalEvent.touches[0] : event;
            var resizeDelta = event.clientX - startX;
            var gridHeadtrLength = gridHeadtr[0].children.length;
            var colGroup = gridHeadTable.find("colgroup");
            var colGroupLength = colGroup[0].children.length;
            var gridHeadthLength = gridHeadth.length;
            var emptyColumn = $(gridHeadth[gridHeadthLength - 1]);
            var HScrollbar = (gridBody[0].scrollWidth > gridBody[0].clientWidth);

            if (!HScrollbar) {
                var width = emptyColumn.width();
                console.log("width:" + width);
                emptyColumn.show();
                gridInstance.element.find(".rq-column-width-readonly").show();
                if (resizeDelta > 0)
                    emptyColumn.width(width + resizeDelta);
                else
                    emptyColumn.width(width - resizeDelta);
            }
            else {
                emptyColumn.hide();
                gridInstance.element.find(".rq-column-width-readonly").hide();
            }

            var newColWidth = colWidth + resizeDelta;

            $colElementHeader.width(newColWidth);
            $colElementBody.width(newColWidth);
            // height must be set in order to prevent IE9 to set wrong height
            $colElementHeader.css("height", "auto");
            $colElementBody.css("height", "auto");
            if (resizeDelta < 0)
                if ((colWidth - settings.minWidth) <= -(resizeDelta)) {
                    $colElementHeader.width(settings.minWidth);
                    $colElementBody.width(settings.minWidth);
                }
            $document.bind("keyup.columnResize", keyup);
        }

        mouseup = function (event) {
            if (event.originalEvent.touches)
                $document.unbind("touchmove.columnResizer");
            else
                $document.unbind("mousemove.columnResizer");
            $document.unbind("keyup.columnResize");
        }

        $document.mouseup(function (event) {
            $document.unbind("mousemove.columnResizer");
            $document.unbind("touchmove.columnResizer");
            $document.unbind("keyup.columnResize");
        });

        keyup = function (event) {
            if (event.keyCode == 27) {
                $document.unbind("mousemove.columnResizer");
                $document.unbind("touchmove.columnResizer");
                $document.unbind("keyup.columnResize");
                $colElementHeader.width(colWidth);
                $colElementBody.width(colWidth);
            }
        }

        _onTouchstart = function (event) {
            var eventBase = (event.touches) ? event.touches[0] : event;
            this.tapDownX = eventBase.clientX;
            this.tapDownY = eventBase.clientY;
            this.touchStartTime = new Date();
        }

        _onTouchend = function (event) {
            var eventBase = (event.changedTouches) ? event.changedTouches[0] : event;
            if (this.tapDownX == eventBase.clientX && this.tapDownY == eventBase.clientY) {
                if (event.pointerType != "mouse" && event.pointerType != 4) {
                    var touchEndTime = new Date() - this.touchStartTime;
                    if (touchEndTime >= 200) {
                        //We are clearing setTimeout to prevent multiple context menu while tapping. 
                        clearTimeout(self.timeOutFunctions);
                        self.timeOutFunctions = setTimeout(function () {
                            //Showing context menu which already created for these tds.
                            $(this).contextMenu({ x: eventBase.clientX, y: eventBase.clientY });
                        } .bind(event.currentTarget), 300);
                    }
                }
            }
        }
        var gridInstance = $(this).data("grid");
        gridHeadTable = gridInstance.uiGridHead.find("table");
        gridHeadtr = gridHeadTable.find("tr");
        gridHeadth = gridHeadTable.find("th");
        gridBody = gridInstance.uiGridBody;
        grid = {};

        grid.ContextMenu = function (className) {
            this.ItemClicked = new ObjectEvent("ItemClicked");
            this.BeforeContextMenu = new ObjectEvent("BeforeContextMenu");
            this.selector = className;
            this.position = { x: 80, y: 100 };
            var contextMenu = this;
            this.Items = [];
            if ($.contextMenu) {
                $.contextMenu({
                    selector: className,
                    position: function (opt, x, y) {
                        opt.$menu.css({ top: y, left: x });
                        contextMenu.position = { x: x, y: y };
                    },
                    build: function ($trigger, e) {
                        // this callback is executed every time the menu is to be shown
                        // its results are destroyed every time the menu is hidden
                        // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
                        if (contextMenu.Items && contextMenu.Items.length > 0) {
                            contextMenu.BeforeContextMenu.raise($trigger, e);
                        }


                        if (e.data.items == undefined || $.isEmptyObject(e.data.items))
                            return false;
                        return {
                            GetPosition: function () {
                                return contextMenu.position;
                            },
                            callback: function (key, options) {
                                contextMenu.ItemClicked.raise(key, options);
                            }
                        };
                    }
                });
            }

            this.BeforeContextMenu.subscribe(function (sender, args) {
                var menuItems = this.Items;
                var menu = args;
                var items = {};
                for (var i = 0; i < menuItems.length; i++) {
                    var keyName = menuItems[i].keyName || menuItems[i].name;
                    if (menuItems[i].separator == true)
                        menu.data.items["separator" + i] = "separator" + i;
                    else
                        menu.data.items[keyName] = { name: menuItems[i].name, icon: menuItems[i].icon, callback: menuItems[i].callback };
                }
            }, this);

            this.AddNewItems = function (menuItems, enableDefaultItems) {
                if (enableDefaultItems == false)
                    this.Items = menuItems;
                else
                    this.Items = this.Items.concat(menuItems);
            }
            return this;
        }

        var ColumnContextMenu = new grid.ContextMenu(".ui-grid-head-table");
        ColumnContextMenu.BeforeContextMenu.subscribe(function ($trigger, e) {
            e.data.items[0].disabled = function () { return true; };
        });
        if (settings.EnableColumnHeaderContextMenu)
            gridInstance.ColumnContextMenu = ColumnContextMenu;

        var hideList = [];
        gridInstance.HideColumn = function (index) {
            var columnInfo = GetColumnbyIndex(index);
            for (var i = 0; i < columnInfo.Header.length; i++)
                $(columnInfo.Header[i]).hide();
            for (var i = 0; i < columnInfo.Cells.length; i++)
                $(columnInfo.Cells[i]).hide();
            gridInstance.element.find("col:eq(" + columnInfo.Index + ")").hide();
            gridInstance.uiGridHead.find("col:eq(" + columnInfo.Index + ")").hide();
            hideList.push(columnInfo.Index);
        };
        gridInstance.ShowColumn = function (index) {
            var columnInfo = GetColumnbyIndex(index);
            for (var i = 0; i < columnInfo.Header.length; i++)
                $(columnInfo.Header[i]).show();
            for (var i = 0; i < columnInfo.Cells.length; i++)
                $(columnInfo.Cells[i]).show();
            gridInstance.element.find("col:eq(" + columnInfo.Index + ")").show();
            gridInstance.uiGridHead.find("col:eq(" + columnInfo.Index + ")").show();
            hideList.splice(hideList.indexOf(columnInfo.Index), 1);
        };
        function GetColumnbyIndex(index) {
            if (typeof (index) === "string") {
                index = $headerCells = $("th#" + index, gridInstance.uiGridHead).index();
            }
            var tableCells = [];
            var tr = gridInstance.element.find("tr");
            for (var i = 0; i < tr.length; i++) {
                tableCells.push(tr[i].children[index]);
            }
            var headerCells = [];
            var th = gridInstance.uiGridHead.find("th");
            headerCells.push(th[index]);

            return { "Header": headerCells, Cells: tableCells, "Index": index };
        }

        var $resizeHelper = gridHeadth.not(".rq-column-width-readonly").find("div.resizeHelper");
        $resizeHelper.bind("mousedown", mousedown);
        $resizeHelper.bind("mouseup", mouseup);
        $resizeHelper.bind("touchstart", mousedown);
        $resizeHelper.bind("touchend", mouseup);
        gridHeadth.bind('touchstart', _onTouchstart);
        gridHeadth.bind('touchend', _onTouchend);
    }
})(jQuery);
