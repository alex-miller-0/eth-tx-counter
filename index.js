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
var start = Number(flags.get('start'));
var end = Number(flags.get('end'));
// Optional, but helpful
var start_block = Number(flags.get('start_block'));
var end_block = Number(flags.get('end_block'));

if (!address) { console.log('Address is required!'); }

// The CSV object to write (timestamp,count)
var csv_header = 'timestamp,transactions\n';
var csv = '';

// Run the script
run();

function run() {
  if (!start_block || !end_block) {
    getBlocks(function(blocks) {
      start_block = blocks[0];
      end_block = blocks[1];
      console.log(`Found blocks: start=${start_block}, end=${end_block}`);
      getCounts(function(_csv) { console.log(_csv); })
    })
  } else {
    getCounts(function(_csv) { console.log(_csv); })
  }
}

// Get a timeseries of counts
// @returns string of form csv (e.g. `15356642345,1\n`)
function getCounts(cb) {
  var store = Array.apply(null, Array(end_block-start_block));
  var count = 0;
  store.forEach(function(s, i) {
    getCountInBlock(start_block+i, address, data, function(timestamp, hits) {
      if (timestamp && hits > 0) { csv += `${timestamp},${hits}\n`; }
      count += 1;
      if (count == store.length) {
        if (csv == '') { cb('No transactions found.'); }
        else { cb(csv_header+_csv)}
      }
    })
  })
}

// Get start and end blocks
// @returns [start_block, end_block]
function getBlocks(cb) {
  console.log('Searching for start and end blocks...')
  web3.eth.getBlockNumber(function(err, countdown) {
    findStartEndBlock(start, end, countdown, null, function(blocks) {
      cb(blocks);
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
    if (err) { console.log('error', err); }
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

// Recursive search for start_block and end_block
function findStartEndBlock(start, end, countdown, end_block, cb) {
  var start_block = null;
  getTimestampForBlock(countdown, function(timestamp) {
    if (timestamp > end) { end_block = countdown; }
    else if (!end_block && timestamp > end) {
      console.log('Your end time is in the future!')
      cb(null);
    }
    if (timestamp < start) { start_block = countdown; }
    countdown -= 1;
    if (start_block && end_block) {
      cb([start_block, end_block]);
    } else {
      findStartEndBlock(start, end, countdown, end_block, cb);
    }
  })
}

// Search for a block by number and return the timestamp
function getTimestampForBlock(n, cb) {
  web3.eth.getBlock(n, true, function(err, result) {
    if (err) { console.log('error', err); }
    else { cb(result.timestamp); };
  });
};
