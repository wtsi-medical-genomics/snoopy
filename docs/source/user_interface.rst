User Interface
==============

.. |ref_loc| image:: /images/ref_loc.png
.. |add_track| image:: /images/add_track.png
.. |track_options| image:: /images/track_options.png
.. |print| image:: /images/print.png
.. |options| image:: /images/options.png
.. |zoom| image:: /images/zoom.png
.. |not_a_variant| image:: /images/not_a_variant.png
.. |uncertain| image:: /images/uncertain.png
.. |variant| image:: /images/variant.png
.. |previous| image:: /images/previous.png
.. |variant_loc| image:: /images/variant_loc.png
.. |view| image:: /images/view.png
.. |restart| image:: /images/restart.png
.. |return_home| image:: /images/return_home.png
.. |save| image:: /images/save.png
.. |snapshot| image:: /images/snapshot.png

Variant Reviewing
-----------------

In the variant reviewing mode you'll have the view:

.. image:: /images/overview.png

There are two main sections in this view: the Snoopy interface and the Dalliance interface.

.. image:: /images/overview_split.png


Dalliance
^^^^^^^^^
Within Dalliance you have access to following:

* |ref_loc| - Lists the genome reference being used and the current chromosome and location. You can change the location by entering either a start and end position or a single base position.
* |zoom| - Control the zoom depth.
* |add_track| - Adds a new track to the current view.
* |track_options| - Modify track options such as the max depth, and colors.
* |print| - Export current view as an SVG or PNG.
* |options| - Change some of Dalliance's options such as vertical guideline location, scrolling direction.

Snoopy
^^^^^^

Variant Decisions
"""""""""""""""""
When either of the decision buttons are clicked, you will advance to the next variant.

* |not_a_variant| - You are certain that the called site is not actually a variant.
* |uncertain| - You are unsure if the called site is a variant.
* |variant| - You are certain that the called variant is truly a variant.

Navigation
""""""""""
* |variant_loc| - This displays the current variant and a QC decision, if available. If you click this button you will presented with a window which summarizes all of the QC decisions made so far, as well as allowing you to quickly navigate to a different variant.
* |return_home| - Returns to the current variant of interest if you've dragged the Dalliance track away.
* |previous| - Go to the previous variant. Clicking this button does not register any variant decisions.

Viewing
"""""""
* |view| - This dropdown button allows you to select four different track styles:
    * Raw - Display the bases with color scheme as specified in the settings.
    * Condensed - Only display a base if it differs from the reference. If a read exists and is in agreement with the reference, use match color as set in your settings.
    * Mismatch - Color code plus strand / minus strand if reference agreement exists. If a base differs, display with the base color as given in settings for raw.
    * Coverage - Presents a histogram of coverage. If more than 20% of the bases differ from reference, the proportion of bases are displayed with their bases colors.
* |snapshot| - Clicking this will take a snapshot of whatever view is currently loaded into Dalliance.

Admin
"""""
* |restart| - Stop and restart Snoopy button, there will be a prompt asking if you wish to save your progress.
* |save| - Save whatever progress you have made so far. The output format is described in :doc:`/file_formats`. 

