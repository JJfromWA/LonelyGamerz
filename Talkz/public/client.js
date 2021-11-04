// Establish a Socket.io connection
const socket = io();

// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const client = feathers();
client.configure(feathers.socketio(socket));

// Use localStorage to store our login token
client.configure(feathers.authentication({
  storage: window.localStorage
}));


// Login screen
const loginHTML = `<main class="login container">
  <header class="w3-container w3-center w3-padding-32">
    <h1><b>Titan</b>Talkz</h1>
    <h2><b>Log in or Sign up</b></h2>
    </div>
  </header>
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">
      <form class="form">
        <p>
          <input class="w3-input w3-section w3-border" type="email" name="email" placeholder="email">
        </p>

        <p>
          <input class="w3-input w3-section w3-border" type="password" name="password" placeholder="password">
        </p>

        </form>


        <div class="w3-center">
        <p><button type="button" id="login" class="w3-button w3-dark-grey w3-padding-large">
          Log in
        </button></p>
        
        <p><button type="button" id="signup" class="w3-button w3-dark-grey w3-padding-large">
          Sign up and log in
        </button></p>

        <p><a class="w3-button w3-dark-grey w3-padding-large" href="/oauth/github">
           Login with GitHub
         </a></p>

        <p><a class="w3-button w3-dark-grey w3-padding-large" href="/oauth/google">
           Login with Google
         </a></p>
        </div>
      
    </div>
  </div>
</main>`;

// Chat base HTML (without user list and messages)
const chatHTML = `<main class="flex flex-column">
<div class="w3-top">
<div class="w3-bar w3-black w3-wide w3-padding w3-card">
  <a href="/" class="w3-bar-item w3-button"><b>Titan</b>Talkz</a>
  <!-- Float links to the right. Hide them on small screens -->
  <div class="w3-right w3-hide-small">
  <a href="https://github.com/JJfromWA/TitanTalkz" class="w3-bar-item w3-button">Our Github</a>
  <div class="w3-dropdown-hover">
    <button class="w3-padding-large w3-button" title="More">
    <img src="/pictures/logo.png" width="30" alt="" class="avatar">
    <i class="fa fa-caret-down"></i></button>
    <div class="w3-dropdown-content w3-bar-block w3-card-4">
        <a href="#" class="w3-bar-item w3-button">Your Profile</a>
        <a href="#" id="logout" class="w3-bar-item w3-button">Sign Out</a>
    </div>
  </div>
</div>
</div>
</div>

<div class="w3-row">
<hr>
<hr>
<hr>
  <div class="w3-col l4">
  <!-- About Card -->
  <div class="w3-card w3-margin w3-white">
  <img src="/pictures/logo.png" style="width:100%">
    <div class="w3-container w3-white">
      <h4><b>Placeholder</b></h4>
      <p>Ribbit Ribbit Ribbit Ribbit Ribbit Ribbit Ribbit Ribbit Ribbit Ribbit Ribbit</p>
    </div>
  </div><hr>
  </div>
</main>`;

// Helper to safely escape HTML
const escape = str => str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Add a new user to the list
const addUser = user => {
  const userList = document.querySelector('.user-list');

  if(userList) {
    // Add the user to the list
    userList.innerHTML += `<li>
      <a class="block relative" href="#">
        <img src="${user.avatar}" alt="" class="avatar">
        <span class="absolute username">${escape(user.name || user.email)}</span>
      </a>
    </li>`;

    // Update the number of users
    const userCount = document.querySelectorAll('.user-list li').length;
    
    document.querySelector('.online-count').innerHTML = userCount;
  }
};

// Renders a message to the page
const addMessage = message => {
  // The user that sent this message (added by the populate-user hook)
  const { user = {} } = message;
  const chat = document.querySelector('.chat');
  // Escape HTML to prevent XSS attacks
  const text = escape(message.text);

  if(chat) {
    chat.innerHTML += `<div class="message flex flex-row">
      <img src="${user.avatar}" alt="${user.name || user.email}" class="avatar">
      <div class="message-wrapper">
        <p class="message-header">
          <span class="username font-600">${escape(user.name || user.email)}</span>
          <span class="sent-date font-300">${moment(message.createdAt).format('MMM Do, hh:mm:ss')}</span>
        </p>
        <p class="message-content font-300">${text}</p>
      </div>
    </div>`;

    // Always scroll to the bottom of our message list
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  }
};

// Show the login page
const showLogin = (error) => {
    if(document.querySelectorAll('.login').length && error) {
      document.querySelector('.heading').insertAdjacentHTML('beforeend', `<p>There was an error: ${error.message}</p>`);
    } else {
      document.getElementById('app').innerHTML = loginHTML;
    }
  };

  // Shows the chat page
const showChat = async () => {
    document.getElementById('app').innerHTML = chatHTML;
  
    // Find the latest 25 messages. They will come with the newest first
    const messages = await client.service('messages').find({
      query: {
        $sort: { createdAt: -1 },
        $limit: 25
      }
    });
    
    // We want to show the newest message last
    messages.data.reverse().forEach(addMessage);
  
    // Find all users
    const users = await client.service('users').find();
  
    // Add each user to the list
    users.data.forEach(addUser);
  };

// Retrieve email/password object from the login/signup page
const getCredentials = () => {
    const user = {
      email: document.querySelector('[name="email"]').value,
      password: document.querySelector('[name="password"]').value
    };
  
    return user;
  };
  
  // Log in either using the given email/password or the token from storage
  const login = async credentials => {
    try {
      if(!credentials) {
        // Try to authenticate using an existing token
        await client.reAuthenticate();
      } else {
        // Otherwise log in with the `local` strategy using the credentials we got
        await client.authenticate({
          strategy: 'local',
          ...credentials
        });
      }
  
      // If successful, show the chat page
      showChat();
    } catch(error) {
      // If we got an error, show the login page
      showLogin(error);
    }
  };
  
  const addEventListener = (selector, event, handler) => {
    document.addEventListener(event, async ev => {
      if (ev.target.closest(selector)) {
        handler(ev);
      }
    });
  };
  
  // "Signup and login" button click handler
  addEventListener('#signup', 'click', async () => {
    // For signup, create a new user and then log them in
    const credentials = getCredentials();
      
    // First create the user
    await client.service('users').create(credentials);
    // If successful log them in
    await login(credentials);
  });
  
  // "Login" button click handler
  addEventListener('#login', 'click', async () => {
    const user = getCredentials();
  
    await login(user);
  });
  
  // "Logout" button click handler
  addEventListener('#logout', 'click', async () => {
    await client.logout();
      
    document.getElementById('app').innerHTML = loginHTML;
  });
  
  // "Send" message form submission handler
  addEventListener('#send-message', 'submit', async ev => {
    // This is the message text input field
    const input = document.querySelector('[name="text"]');
  
    ev.preventDefault();
  
    // Create a new message and then clear the input field
    await client.service('messages').create({
      text: input.value
    });
  
    input.value = '';
  });
  
  // Listen to created events and add the new message in real-time
  client.service('messages').on('created', addMessage);
  
  // We will also see when new users get created in real-time
  client.service('users').on('created', addUser);
  
  // Call login right away so we can show the chat window
  // If the user can already be authenticated
  login();
  
