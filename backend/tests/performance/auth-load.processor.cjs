module.exports = {
  generateUser,
};

function generateUser(userContext, events, done) {
  const now = Date.now();
  const random = Math.floor(Math.random() * 1000000);

  userContext.vars.name = `Perf User ${random}`;
  userContext.vars.email = `perf_${now}_${random}@example.com`;
  userContext.vars.password = "secret123";

  return done();
}
