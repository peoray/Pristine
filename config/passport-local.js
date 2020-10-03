const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  //   'local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'passwd',
    },
    async (username, password, done) => {
      try {
        // check if email exists
        const user = await User.findOne({
          'local.username': username,
        });
        if (!user) {
          return done(null, false, {
            message: 'unknown user',
          });
        }
        // check if password is the same(user password input and db password)
        const isValid = await User.comparePassword(
          password,
          user.local.password
        );
        if (!isValid) {
          return done(null, false, {
            message: 'unknown password',
          });
        }
        if (!user.local.active) {
          return done(null, false, {
            message: 'You need to verify email first!',
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
