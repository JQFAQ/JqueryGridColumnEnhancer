jQuery Grid ColumnEnhancer
========================

<strong>DESCRIPTION</strong>

The columnEnhancer plugin allows the end user to resize the width of the column and also provides a context menu to show/hide columns in the grid.

The plugin is also supported in all touch based mobile devices.

<strong>OPTIONS</strong>

Here are the plugin's options and their default values:

minWidth: 20 - specifies the minimum width of the column upto which it can be resized
EnableColumnHeaderContextMenu: false - boolean property that specifies whether the context menu has to be enabled or not.

<strong>USAGE</strong>

<strong>Getting Started</strong>

Add a table to your html on which the column resizer is to be applied.

Extend the above table to enable column resizer as follows,

<b>$(document).ready(function(){ $("#developers-local").columnResize(); });</b>


<strong>Setting minimum resize width</strong>


<b>$("#developers-local").columnEnhancer({ minWidth: 20 });</b>


<strong>Enabling context-menu</strong>

Turn on context menu on the grid header as follows:

$("#developers-local").columnEnhancer({ EnableColumnHeaderContextMenu: true });

This table header context menu allows you to hide or show specific columns. This also prevents all columns from getting hidden.

The context menu utility we are using to implement the context menu was downloaded from http://medialize.github.com/jQuery-contextMenu/


<strong>Sponsored By</strong><div><a href="http://radiantq.com/"><img src="http://jqfaq.com/wp-content/uploads/banner_468x60.jpg"</a></div>


