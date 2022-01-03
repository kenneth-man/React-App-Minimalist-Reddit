# React App - Minimalist Reddit Clone

React app to practice using Firebase v9 CRUD Operations, Context, React Hooks, ES6+ Javascript, Functional components

![Alt text](./src/Res/Images/sampleScreenshot1.png?raw=true "Login")
![Alt text](./src/Res/Images/sampleScreenshot2.png?raw=true "Register")
![Alt text](./src/Res/Images/sampleScreenshot3.png?raw=true "SubReddit")
![Alt text](./src/Res/Images/sampleScreenshot4.png?raw=true "Profile") 
![Alt text](./src/Res/Images/sampleScreenshot5.png?raw=true "GlobalChat") 
![Alt text](./src/Res/Images/sampleScreenshot6.png?raw=true "PrivateChat") 
![Alt text](./src/Res/Images/sampleScreenshot7.png?raw=true "SearchBar") 
![Alt text](./src/Res/Images/sampleScreenshot8.png?raw=true "Modal") 

<br/>
<br/>

__Main Features__:

* use email to sign-in/register or google auth to sign-in

* private messaging (privateChat)

* community messaging (globalChat)

* profile:
- edit title, description
- start private message button (if not own profile)
- signout button (if own profile)
- edit button (if own profile)
- show 3 latest posts if any

* home: 
- shows posts from all subreddits the user is subscribed to
- searchbar to search for subreddits, users
- list of all subscribed subreddits; clickable
- create new subreddit button which enables a modal

* subreddit: 
- button for a user to subscribe/unsubscribe to that subreddit
- button to create new post in that subreddit
- subreddit title, description, image, number of total subscribers, show Moderator's name (the user who created it; only can own one subreddit per user)
- can delete subreddit (if own subreddit)

* posts: 
- commenting, likes, dislikes, delete (if own post or own subReddit)
- can delete posts (if own post or own subreddit)

<br/>
<br/>

NPM packages used: firebase, react-lazy-loading-image-component, react-router-dom