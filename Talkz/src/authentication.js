const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication')
const { LocalStrategy } = require('@feathersjs/authentication-local')
const axios = require('axios');
const { expressOauth, OAuthStrategy } = require('@feathersjs/authentication-oauth')


class GitHubStrategy extends OAuthStrategy {
  async getEntityData(profile) {
    const baseData = await super.getEntityData(profile);

    return {
      ...baseData,
      // You can also set the display name to profile.name
      name: profile.name,
      // The GitHub profile image
      avatar: profile.avatar_url,
      // The user email address (if available)
      email: profile.email
    };
  }
}

class GoogleStrategy extends OAuthStrategy {
  async getEntityData(profile) {
  
    // this will set 'googleId'
    const baseData = await super.getEntityData(profile);
    
    // this will grab the picture and email address of the Google profile
    return {
      ...baseData,
      name: profile.name,
      
      email: profile.email
    };
  }
}



module.exports = app => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())
  authentication.register('github', new GitHubStrategy());
  authentication.register('google', new GoogleStrategy());

  app.use('/authentication', authentication)
  app.configure(expressOauth())
}
