(function ($) {

    $.fn.ColumnEnhancer = function (options) {
        var $document = $(document);
        // Establish our default settings
        var settings = $.extend({
            minWidth: 20,
            GetGridInstance: function () {
                return $(this).data("GanttTableBase");
            }
        }, options);

        var colWidth, startX, gridBody, gridHeadTable, $colElementHeader, $colElementBody, gridHeadth, lastColumnHeader, lastColumnBody;
        var lastColumnHeaderWidth, lastColumnBodyWidth, resizeStart=false;
        mousedown = function (event) {

            $document.bind("mousemove.columnResizer", $.proxy(mouseMove, this));
            $document.bind("touchmove.columnResizer", $.proxy(mouseMove, this));


            var event = (event.originalEvent.touches) ? event.originalEvent.touches[0] : event;
            this.startX = event.clientX;
            var colIndex = $(event.currentTarget).closest("th")[0].cellIndex + 1;
            //To prevent resizing the column which has the rq-column-width-readonly class
            if ($(gridHeadth[colIndex - 1]).hasClass("rq-column-width-readonly")) {
                event.preventDefault();
                return;
            }

            this.$colElementHeader = gridHeadTable.find("colgroup > col:nth-child(" + colIndex + ")");//Header col element
            this.$colElementBody = gridBody.find("colgroup > col:nth-child(" + colIndex + ")");//body col element

            var lastColumn = gridInstance.uiGridHead.find("th:visible:last");//To get the last visible columns.

            var gridHeadColGroup = gridHeadTable.find("colgroup");
            this.lastColumnHeader = $(gridHeadColGroup[0].children[lastColumn[0].cellIndex]);

            var gridBodyColGroup = gridBody.find("colgroup");
            this.lastColumnBody = $(gridBodyColGroup[0].children[lastColumn[0].cellIndex]);

          
            this.lastColumnHeaderWidth = parseInt(this.lastColumnHeader.get(0).style.width, 10);
            this.lastColumnBodyWidth = parseInt(this.lastColumnBody.get(0).style.width, 10);

            if (gridHeadth.length <= 1)
                this.colWidth = gridHeadth.width();
            else
                if (this.$colElementHeader.get(0) == undefined)
                    return;
                else
                    this.colWidth = parseInt(this.$colElementHeader.get(0).style.width, 10);
            resizeStart = true;
        }

        mouseMove = function (event) {
            if (resizeStart) {
                event.preventDefault();
                var event = (event.originalEvent.touches) ? event.originalEvent.touches[0] : event;
                var resizeDelta = event.clientX - this.startX;

                this.lastColumnHeader.width(this.lastColumnHeaderWidth - resizeDelta);
                this.lastColumnBody.width(this.lastColumnBodyWidth - resizeDelta);

                var newColWidth = this.colWidth + resizeDelta;
                this.$colElementHeader.width(newColWidth);
                this.$colElementBody.width(newColWidth);

                // height must be set in order to prevent IE9 to set wrong height
                this.$colElementHeader.css("height", "auto");
                this.$colElementBody.css("height", "auto");
                if (resizeDelta < 0)
                    if ((this.colWidth - settings.minWidth) <= -(resizeDelta)) {
                        this.$colElementHeader.width(settings.minWidth);
                        this.$colElementBody.width(settings.minWidth);
                    }
                $document.bind("keyup.columnResize", $.proxy(keyup, this));
            }
        }

        mouseup = function (event) {
            if (resizeStart) {
                $document.unbind("touchmove.columnResizer");
                $document.unbind("mousemove.columnResizer");
                $document.unbind("keyup.columnResize");
            }
        }

        $document.mouseup(function (event) {
            if (resizeStart) {
                $document.unbind("mousemove.columnResizer");
                $document.unbind("touchmove.columnResizer");
                $document.unbind("keyup.columnResize");
            }
        });

        keyup = function (event) {
            if (event.keyCode == 27) {
                if (resizeStart) {
                    $document.unbind("mousemove.columnResizer");
                    $document.unbind("touchmove.columnResizer");
                    $document.unbind("keyup.columnResize");
                    this.$colElementHeader.width(this.colWidth);
                    this.$colElementBody.width(this.colWidth);
                }
            }
        }

        _onTouchstart = function (event) {
            var eventBase = (event.originalEvent.touches) ? event.originalEvent.touches[0] : event;
            this.tapDownX = eventBase.clientX;
            this.tapDownY = eventBase.clientY;
            this.touchStartTime = new Date();
        }

        _onTouchend = function (event) {
            var eventBase = (event.originalEvent.changedTouches) ? event.originalEvent.changedTouches[0] : event;
            if (this.tapDownX == eventBase.clientX && this.tapDownY == eventBase.clientY) {
                if (event.pointerType != "mouse" && event.pointerType != 4) {
                    var touchEndTime = new Date() - this.touchStartTime;
                    if (touchEndTime >= 200) {
                        //We are clearing setTimeout to prevent multiple context menu while tapping. 
                        clearTimeout(self.timeOutFunctions);
                        self.timeOutFunctions = setTimeout(function () {
                            //Showing context menu which already created for these ths.
                            $(this).contextMenu({ x: eventBase.clientX, y: eventBase.clientY });
                        }.bind(event.currentTarget), 300);
                    }
                }
            }
        }

        var gridInstance = settings.GetGridInstance.call(this);
        gridHeadTable = gridInstance.uiGridHead.find("table");
        gridHeadth = gridHeadTable.find("th");
        gridBody = gridInstance.uiGridBody;

        var ColumnContextMenu = new RadiantQ.Gantt.ContextMenuImpl.ContextMenu(".rq-grid-head-parent");
        ColumnContextMenu.BeforeContextMenu.subscribe(function ($trigger, e) {
            e.data.items[0].disabled = function () { return true; };
        });
        if (gridInstance.options.EnableColumnHeaderContextMenu)
            gridInstance.ColumnContextMenu = ColumnContextMenu;
       
       if(gridInstance.options.EnableColumnHeaderContextMenu == true)
        {
            var columnContextMenu = gridInstance.ColumnContextMenu;
            var columnCount = gridHeadth.length;
            var columnContextMenuItem = [];
            var columns = gridHeadth.find("div").not(".resizeHelper");
            for (var i = 0; i < columnCount; i++) {
                var name = $(columns[i]).text();
                var menuItem = ColumnContextMenuItem(i, name, name, callback, gridInstance, { index: i, column: columns[i] });
                columnContextMenuItem.push({ keyName: menuItem.keyName, name: menuItem.name, icon: menuItem.icon, callback: menuItem.callback });
            }
            columnContextMenu.AddNewItems(columnContextMenuItem, true);
        }
        function callback(key, opt) {
            var index = this.Column.index;

            if (this.Context.hideList.containsValue(index) == true)
                this.Context.ShowColumn(index);
            else
                this.Context.HideColumn(index);

        }

        function ColumnContextMenuItem(_keyName, _name, _icon, _callback, context, column) {
            this.keyName = _keyName.toString();
            this.name = _name;
            this.icon = _icon;
            this.callback = $.proxy(_callback, { Context: context, Column: column });
            return this;
        }

        var $resizeHelper = gridHeadth.not(".rq-column-width-readonly").find("div.resizeHelper");
        $resizeHelper.bind("mousedown", mousedown);
        $resizeHelper.bind("mouseup", mouseup);
        $resizeHelper.bind("touchstart", mousedown);
        $resizeHelper.bind("touchend", mouseup);
        gridHeadth.bind("touchstart", _onTouchstart);
        gridHeadth.bind("touchend", _onTouchend);
    }
})(jQuery);
