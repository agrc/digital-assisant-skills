# Innovation Grant Accomplishments

A google assistant skill feature complete with the alexa skill. We [recorded what the skill](https://vimeo.com/338993298) is able to do for your viewing pleasure.

## Design Decisions

We decided to use the javascript programming language for this skill. The reason being that firebase functions only support javascript.

## Onboarding

Bringing developers into the Google Assistant was simple. We all already have google.gov emails and every user gets access to Google Cloud Projects.

## Side effects

During the creation of this skill we reviewed what data and api's were available to make this skill possible. This skill looked at using data from three agencies.

1. AGRC
   - api.mapserv.utah.gov
   - gis spatial requests
1. Utah State Legislature
   - glen.le.utah.gov
   - legislator and session information
1. Elections
   - vote.utah.gov
   - voter and voting information

The AGRC api worked great for this skill and required no modifications. Geocoding the device address and searching for policital districts is very simple. The documentation is satisfactory.

The legislature api handled the alexa use case very well. The documentation is satisfactory. The developers are willing to improve their api. They added ~6 new endpoints after we had some discussions.

One area that falls short and could be improved is the purpose of the data is optimized to be displayed on websites. This creates a challenge as we transition to supporting voice. It is difficult to use the data without sounding like a robot.

The vote api is complicated and had no documentation. It appeared to be a private api built specifically for the vote website. The developers are willing to improve the api but we did not have time to create a plan and approach them with the details.

## Ongoing

We could meet with legislators in the house and senate to present on new possibilities created by this skill. Currently, there is a form submitted to le.utah.gov with legislator information. If we could influence that form, this skill and others would benefit. Since screens are more and more common on digital assistant devices, short video clips could be presented to users. The audio coud be played on devices without a screen.

We could create api reports for agencies so they can understand what is missing, lacking, or requiring improvement in their api coverage. This would fit into Mike's api creation initiative as it would give ideas to agencies on what to build.

While exploring the opportunities for this skill, generated a script similar to a playwright of how users could interact. This script could be complimented/enhanced by software designed for conversation. I believe it would be in the best interest of DTS and the agencies it supports to purchase a software to assist in the creation of voice skills.
