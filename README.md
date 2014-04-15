JqueryGridColumnEnhancer
========================

DESCRIPTION:

The columnEnhancer plug-in allows you to resize the width of the column and provides a context menu to show/hide columns in the grid.

The plug-in is supported in all touch based mobile devices.

OPTIONS:

Here are the plug-in's options and their default values 

minWidth: 20 - specifies the minimum width of the column upto which it can be resized
EnableColumnHeaderContextMenu: false - boolean property that specifies whether the context menu has to be enabled or not.

USAGE:

Getting Started:

Add a table to your html on which the column resizer is to be applied.

Extend the above table to enable column resizer as follows,

$(document).ready(function(){ $("#developers-local").columnResize(); });


Setting minimum width:

This will sets the minimum width to the column.

$("#developers-local").columnResize({ minWidth: 20 });


Enabling context-menu:

This property allows you to enable or disable the column header context menu.

$("#developers-local").columnResize({ EnableColumnHeaderContextMenu: true });

This table header context menu allows you to hide or show specific columns, also it prevents all columns from getting hidden.
