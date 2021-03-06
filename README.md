# [YouTubeMod.com](https://youtubemod.com/)

## About

Allows you to create a YouTube URL with multiple start and stop times to skip
over content you're not interested in. Natively, YouTube allows just one start and one end time. Amounts to the hacky use of the YouTube iframe API behind a borrowed html template to fix a "problem" which will never cross the minds of most people but which I and a select few found horribly frustrating.

## Preview

![Demo Gif](/img/YouTubeModDemo.gif)
![Customization Page](/img/SitePreview2.png)
![Customization Page With Custom URL Row](/img/SitePreview3.png)

## Background

This project was inspired by the New York Times Article [How to Link to the Good Part of the YouTube Video](https://www.nytimes.com/2016/12/07/technology/personaltech/how-to-link-to-the-good-part-of-the-youtube-video.html). There are sites like [youtubetime.com](http://youtubetime.com/) which appends the start and optional end time to the end of the normal url in the correct format.

However, you cannot natively (or through any service I was able to find at the start of this project) have *multiple* start and stop times (e.g. start at minute 1, stop at minute 3, pick-up again at minute 4, and end at minute 7).

YouTube has a Javascript iFrame API which allows some customization of the controls and user experience of a YouTube video in an iFrame on an external site. While you can create a listener to get the current state of a video (e.g. paused, playing, buffering, etc.), you cannot listen to see when the video has reached a certain point using the API, which makes implementing the above much trickier. However, there is an API method to jump-to a specific time in the video.

## Acknowledgments

Thanks to [Dave Miller](http://davidmiller.io/), creator of [this lovely Boostrap landing page template](https://startbootstrap.com/template-overviews/landing-page/) which I thoroughly butchered, Professors [Mathew Spitzer](https://www.linkedin.com/in/matt-spitzer-60434a13/) and [Daniel Nash](https://www.linkedin.com/in/daniel-nash-4a39865/) for their webdev classes, [Jonathan Hartley](https://www.tartley.com/) for his encouragement and undeserved compliments, [Paris Hare](https://www.linkedin.com/in/paris-hare-ba8633b0/) for his insistence that I "be a [project] finisher", and most of all to Patrick Spinler for his unending patience, kindness, and mentorship.

## Approaches I Considered or Tried (probably more than you care to know)
1.	Create a video, identical to the original one, but with all the times that were not to be played, removed. The result would have played the desired sections, but would not have allowed the user to go to parts of the video that had been cropped out should they desire to do so; instead they would have to go to the original URL. Potentially needing to go to multiple URLs struck me as far too clunky.
2.	Using the API method to create and play a playlist of given URLs, I made a playlist of URLs with start and stops at given times (recall that YouTube allows for one start time value and one end time value in a URL). The first video would start at the first desired time, and end at the first desired end time; the second video would start at the second desired start time, and end at the second desired end time, etc. It worked, but each video had to be loaded, meaning that at each start time there was a significant lag time as the next video buffered.
3.	Attach a listener to the video that listens for the stop times and jumps at those times (again the API has no function for this). I was optimistic about this strategy, but abandoned it after I discovered I could not attach a listener to the video object because iFrames do not allow cross-browser access (which would be needed) to the DOM of the element which they contain, for security reasons.
4.	Set multiple timeouts in the video at the specified end-times, then use the API skip-to method to advance to the next start time. This worked, but not seamlessly. While the first one or two start and stop times were usually spot-on, the slight browser buffering time made later jumps a few seconds off. While I could have listened for that buffering time using the API method, then accounted for it in the jumps, this seemed especially hacky and fragile.
5.	Poll the video object repeatedly to the get the current time (as mentioned, actually listening for a current time isn’t possible through the API) and then skipping to a next start time as the end times are reached. Javascript does not have a sleep method which would be needed, but async/wait and Promises in ES2018 could implement something similar. This solution is probably ideal for the user experience (pausing the video at any point would not ruin the flow as other solutions do) although it would likely be fragile for slow or interrupted connections and also require more bandwith.
6.	Similar to number 4, but an attempt to avoid the buffering problem: instead of setting all the timeouts initially, setting new timeouts (i.e. a stop times) iteratively, only after the video had advanced to the segment where that timeout would be used. For example, if a video was to be played from minute 1 to minute 3, then from minute 4 to minute 5, an initial timeout would be set at time 0, which would call function advance-to with the one minute argument. After advancing, the time is checked to confirm that the video is at the 1 minute mark and if so, set’s another timeout for two minutes (to account for the two minutes of playtime between minute 1 and 3), at which point the advance-to function will again be called to jump to minute 4. The problem with this strategy is that there is not a natural method to signal that a jump has just occurred so that a new timeout can be set. My work around is to stop and then immediately restart the video after a jump to trigger a playback change event, which will call the iterated timeout function on that segment. Even though the stop and restart is nearly instantaneous, it is noticeable as videos in a paused state display a “other videos” menu if the user is logged into their YouTube account, which cannot be disabled.

&copy; 2020 Ryan Lenea
