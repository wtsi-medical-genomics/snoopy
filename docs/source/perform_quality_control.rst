.. _perform_quality-control:


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


Perform Quality Control
-----------------------
After starting snoopy from the terminal, a new browser tab will open and present you with the first screen: mode selection. Using :ref:`loading-data` as a guide, select the relevant mode and load your data. It's time to view each of the variant sites and record your decision. The following is a walk through guide, for a description of specific parts of the user inteface refer to :doc:`/user_interface`. 

1. Upon starting, the first variant in the first session will be viewed.
2. Explore the current variant location:
    * Drag the Dalliance track around.
    * Zoom in or out with |zoom|
    * There are several different view styles to present the sequence data which can be selected with the |view| dropdown button.
3. Make a decision about the called variant site.
    * |not_a_variant| - You are certain that the called site is not actually a variant.
    * |uncertain| - You are unsure if the called site is a variant.
    * |variant| - You are certain that the called variant is truly a variant.
4. Take a snapshot (PNG) of the current view with |snapshot|.
5. After each decision, Snoopy will load the next variant in that session, or if you have reviewed all in that session, it will load the next session's sequence files and the first variant location.
6. If you wish to review your QC decisions made so far, click |variant_loc|. From window you can also quickly navigate to a different variant too.
7. Save your results so far with |save|. Refer to :doc:`/file_formats` for information about the file format in which the results are saved.
8. Once you have reviewed all variants in all of the sessions, you will be presented with a save dialoge.
9. If at any point you wish to stop reviewing the loaded sessions and start again click |restart|.
