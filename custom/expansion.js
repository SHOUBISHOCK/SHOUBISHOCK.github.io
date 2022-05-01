"use strict";
$(document).ready(function() {
	$( "h3" ).click(function() {
		var h3Element = $(this);
		var showLink = $(this).next();
		showLink.toggleClass( "hide" );
		
		var h3ElementText = h3Element.text();
		
		if (h3ElementText == "Click Here - List of Plugins")
			h3Element.html("List of Server Plugins");
		else if (h3ElementText == "List of Server Plugins")
			h3Element.html("Click Here - List of Plugins");
		
		else if (h3ElementText == "Click Here - FAQs")
			h3Element.html("Frequently Asked Questions");
		else if (h3ElementText == "Frequently Asked Questions")
			h3Element.html("Click Here - FAQs");
		
		else if (h3ElementText == "Click Here - Workshop Maps")
			h3Element.html("Our Workshop Map Collection");
		else if (h3ElementText == "Our Workshop Map Collection")
			h3Element.html("Click Here - Workshop Maps");
		
		else if (h3ElementText == "Click Here - Balance Changes")
			h3Element.html("Balance Changes to Nuclear Dawn");
		else if (h3ElementText == "Balance Changes to Nuclear Dawn")
			h3Element.html("Click Here - Balance Changes");
		
	}); // end <a> click
}); // end ready