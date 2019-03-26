const { Client, Pool } = require("pg")

exports.handler = function(event, context, callback) {
  const client = new Client({
    user: 'sa',
    host: 'teamd5.c2pdixcrwchd.us-east-1.rds.amazonaws.com',
    database: 'teamd5',
    password: 'teamd5teamd5',
    port: 5432,
  })
  client.connect()

  const query = {
    text: 'SELECT * FROM "Jobs" LIMIT 100',
    values: []
  }

  client.query(query, (err, res) => {

    console.log(err,res);
    if(err) {
      client.end();
      context.fail(err);
    }

    client.end();
    context.succeed(res.rows);
  })
};
