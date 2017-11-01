/*
Search for the number of transactions going to a specific address over a given
period of time. Optionally, you may filter by the transaction data.
*/
var Promise = require('bluebird').Promise;
var Web3 = require('web3');
var flags = require('node-flags');

// Initialize web3. Uses localhost:8545 by default
var PROVIDER_URL = 'http://localhost:8545'
var web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));

// Optional flags
var data = flags.get('data');
var address = flags.get('address').toLowerCase();
var start_block = Number(flags.get('start'));
var end_block = Number(flags.get('end')) || start_block + 1;
// Initialize the data store
if (end_block < start_block || typeof end_block != 'number'
  || typeof start_block != 'number' || !address) { console.log('Bad input'); }
var store = Array.apply(null, Array(end_block-start_block));

// The CSV object to write (timestamp,count)
var csv = 'timestamp,transactions\n';

// Run the script
run();

function run() {
  var count = 0;
  store.forEach(function(s, i) {
    getCountInBlock(start_block+i, address, data, function(timestamp, hits) {
      if (timestamp && count > 0) { csv += `${timestamp},${hits}\n`; }
      count += 1;
      if (count == store.length) {
        console.log(csv);
      }
    })
  })
}


// Get the number of transactions in a block
// @returns (int, int)
function getCountInBlock(n, addr, data, cb) {
  var timestamp = null;
  var hits = 0;
  var count = 0;
  // Get all of the transactions in a block
  web3.eth.getBlock(n, true, function(err, result) {
    if (err) { reject(err); }
    else {
      // Save the timestamp
      timestamp = result.timestamp;
      // For each transaction, increase the counter if the data matches
      // or if no data restriction was provided.
      result.transactions.forEach(function(tx) {
        if (tx.to) { tx.to = tx.to.toLowerCase(); }
        if (tx.to == addr) {
          if (data && tx.data == data) {
            hits += 1;
          } else if (!data) {
            hits += 1;
          }
        }
        count += 1;
        if (count == result.transactions.length) {
          cb(timestamp, hits);
        }
      });
    };
  });
}
