## IMPORTANT - April 2015
# HMRC have changed the format that they require submissions in, and this app has not been updated (yet). You cannot use it for submitting claims at present.

Gift-Aid-O-Matic
================

Free software to submit charity Gift Aid claims.

# Installation

Package downloads are available for Windows and Max OS X. Check [releases](https://github.com/webcollective/Gift-Aid-O-Matic/releases).

# Usage

On first run, you will need to enter settings including your HMRC Charities Online username, registered charity number and Authorized Official contact details.

You can then load your data from a CSV file. Please see http://webcollective.io/gift-aid#format for details of the data format.

You can add adjustments for previous overclaims before submitting your claim.

No data is sent to servers other than HMRC's at any stage.

# Technical

Gift-Aid-O-Matic is developed using [TideSDK](http://www.tidesdk.com/). It uses HTML/Javascript for the interface and to build and submit the XML files, and Ruby to sign them for HMRC.

# Limitations

Gift-Aid-O-Matic does not yet support GASDS claims, sponsored event claims, or the inclusion of Other Income in submissions.

# Contributing

Contributions are welcome: please send a pull request. For security reasons please do not commit your binary packages.


